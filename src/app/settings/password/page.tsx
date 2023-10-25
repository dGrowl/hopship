import { redirect } from 'next/navigation'

import { extractAuth } from '../../../lib/cookies'
import UpdatePasswordForm from './UpdatePasswordForm'

export const metadata = {
  title: 'hopship: Change Password',
}

const PasswordSettingsPage = async () => {
  const auth = await extractAuth()
  return auth ? (
    <UpdatePasswordForm name={auth.name} />
  ) : (
    redirect('/logout/login')
  )
}

export default PasswordSettingsPage
