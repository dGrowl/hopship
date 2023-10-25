import { redirect } from 'next/navigation'

import { extractAuth } from '../../../lib/cookies'
import db from '../../../lib/db'
import UpdateUserForm from './UpdateUserForm'

export const metadata = {
  title: 'hopship: Update User Details',
}

const fetchBio = async (name: string) => {
  try {
    const result = await db.query(
      `
        SELECT u.bio
        FROM public.users u
        WHERE u.name = $1;
      `,
      [name]
    )
    if (result.rowCount === 1) {
      return result.rows[0].bio
    }
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
  const bio = await fetchBio(auth.name)
  if (!bio) {
    return null
  }
  return { ...auth, bio }
}

const UserSettingsPage = async () => {
  const user = await load()
  return user ? <UpdateUserForm {...user} /> : redirect('/logout/login')
}

export default UserSettingsPage
