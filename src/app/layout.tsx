import { BsSlash } from 'react-icons/bs'
import { cookies } from 'next/headers'
import { ReactNode } from 'react'
import * as jose from 'jose'
import Link from 'next/link'

import { JWT_AUTH_SECRET } from '../lib/env'
import backdrop from './base/Backdrop'
import HomeBar from './base/HomeBar'

import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/variables.css'
import styles from '../styles/App.module.css'

export const metadata = {
  title: 'hopship',
  description:
    'A searchable index of user accounts across different web platforms. Come find all of your friends!',
  viewport: 'width=device-width, initial-scale=1.0',
}

const extractAuthName = async () => {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('auth')
  if (!authCookie) {
    return null
  }
  try {
    const { payload } = await jose.jwtVerify(authCookie.value, JWT_AUTH_SECRET)
    return payload.sub || null
  } catch (error) {
    console.error(error)
  }
  return null
}

interface Props {
  children: ReactNode
}

const RootLayout = async ({ children }: Props) => {
  const userName = await extractAuthName()
  return (
    <html lang="en">
      <body>
        {backdrop}
        <HomeBar userName={userName} />
        <main className={styles.main}>{children}</main>
        <footer id={styles.footer}>
          <div>
            <Link href="/about/mission">about</Link>
            <BsSlash />
            <Link href="/about/help">help</Link>
            <BsSlash />
            <Link href="/about/privacy">privacy</Link>
            <BsSlash />
            <Link href="/about/terms">terms</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}

export default RootLayout
