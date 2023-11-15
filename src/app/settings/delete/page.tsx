import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { extractAuth } from 'lib/cookies'
import RemoveUserForm from './RemoveUserForm'

export const metadata: Metadata = {
  title: 'hopship: Delete Account',
}

const DeleteUserPage = async () => {
  const auth = await extractAuth()
  return auth ? <RemoveUserForm name={auth.name} /> : redirect('/logout/login')
}

export default DeleteUserPage
