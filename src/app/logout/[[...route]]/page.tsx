import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'hopship: Logout',
}

const authRoutes = new Set(['settings'])

const LogoutPage = ({ params }: { params: Record<string, string[]> }) => {
  let destination = '/'
  if (params.route) {
    if (authRoutes.has(params.route[0])) {
      destination += 'login'
    } else {
      destination += params.route.join('/')
    }
  }
  return redirect(destination)
}

export default LogoutPage
