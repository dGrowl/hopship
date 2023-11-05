import { createHash } from 'crypto'

import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { extractAuth } from '../../../../lib/cookies'
import { Identity } from '../../../../lib/types'
import { NETWORK_PLATFORM } from '../../../../lib/util'
import { VERIFICATION_SECRET } from '../../../../lib/env'
import db from '../../../../lib/db'
import RemoveIdentityForm from './RemoveIdentityForm'
import UpdateIdentityForm from './UpdateIdentityForm'
import VerifyIdentityForm from './VerifyIdentityForm'

import styles from '../../../../styles/IdentitySettings.module.css'

interface MetaProps {
  params: {
    network: string
    name: string
  }
}

export const generateMetadata = ({ params }: MetaProps): Metadata => ({
  title: `hopship: ${params.network}/${params.name} Settings`,
})

const genVerificationDetails = (userID: number, identity: Identity) => {
  const timestampMs = Math.floor(Date.now() / 1000).toString()
  const hash = createHash('sha256')
  hash.update(userID.toString())
  hash.update(identity.network)
  hash.update(identity.name)
  hash.update(timestampMs)
  hash.update(VERIFICATION_SECRET)
  return {
    hash: hash.digest('base64url'),
    timestampMs,
  }
}

const fetchIdentity = async (
  userName: string,
  network: string,
  networkName: string
) => {
  try {
    const result = await db.query(
      `
        SELECT
          u.id AS user_id,
          i.description AS desc,
          i.network,
          i.name,
          i.status
        FROM public.identities i
          INNER JOIN public.users u
            ON u.id = i.user_id
        WHERE u.name = $1
          AND i.network = $2
          AND i.name = $3;
      `,
      [userName, network, networkName]
    )
    if (result.rowCount === 1) {
      return {
        ...result.rows[0],
        platform: NETWORK_PLATFORM[network],
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

const load = async (network: string, networkName: string) => {
  const auth = await extractAuth()
  if (!auth) {
    return null
  }
  const identity = await fetchIdentity(auth.name, network, networkName)
  if (!identity) {
    return null
  }
  return identity
}

const IdentitySettings = async ({
  params,
}: {
  params: Record<string, string>
}) => {
  const data = await load(params.network, params.name)
  if (!data) {
    return redirect('/settings/identities')
  }
  const { user_id: userID, ...identity } = data
  return (
    <article id={styles.container}>
      {identity.status === 'VERIFIED' ? null : (
        <VerifyIdentityForm
          identity={identity}
          verification={genVerificationDetails(userID, identity)}
        />
      )}
      <UpdateIdentityForm identity={identity} />
      <RemoveIdentityForm identity={identity} />
    </article>
  )
}

export default IdentitySettings
