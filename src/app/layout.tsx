import { BsSlash } from 'react-icons/bs'
import { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import Link from 'next/link'

import { extractAuth } from '../lib/cookies'
import backdrop from './base/Backdrop'
import HomeBar from './base/HomeBar'

import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/variables.css'
import styles from '../styles/App.module.css'

export const metadata: Metadata = {
  title: 'hopship',
  description:
    'A searchable index of user accounts across different web platforms. Come find all of your friends!',
}

export const viewport: Viewport = {
  initialScale: 1.0,
  themeColor: 'rgb(22, 22, 22)',
  width: 'device-width',
}

interface Props {
  children: ReactNode
}

const RootLayout = async ({ children }: Props) => {
  const auth = await extractAuth()
  return (
    <html lang="en">
      <body>
        {backdrop}
        <HomeBar userName={auth?.name || null} />
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
