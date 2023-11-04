import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { extractAuth } from '../../../lib/cookies'
import { Identity } from '../../../lib/types'
import db from '../../../lib/db'
import EditableIdentitiesList from './EditableIdentitiesList'

export const metadata: Metadata = {
  title: 'hopship: Manage Identities',
}

const fetchIdentities = async (
  userName: string
): Promise<Identity[] | null> => {
  if (!userName) {
    return null
  }
  try {
    const result = await db.query(
      `
        SELECT
          i.platform,
          i.network,
          i.name,
          i.description AS desc,
          i.status
        FROM public.identities i
          INNER JOIN public.users u
            ON u.id = i.user_id
        WHERE u.name = $1;
      `,
      [userName]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return null
}

const load = async () => {
  const auth = await extractAuth()
  if (!auth) {
    return null
  }
  const identities = await fetchIdentities(auth.name)
  if (!identities) {
    return null
  }
  return identities
}

const IdentitiesSettingsPage = async () => {
  const identities = await load()
  return identities ? (
    <EditableIdentitiesList identities={identities} />
  ) : (
    redirect('/logout/login')
  )
}

export default IdentitiesSettingsPage
