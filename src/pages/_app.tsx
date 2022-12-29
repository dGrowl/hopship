import Head from 'next/head'
import jwt from 'jsonwebtoken'
import Link from 'next/link'
import type { AppContext } from 'next/app'

import { AuthPayload, ExtendedAppProps, ExtendedRequest } from '../lib/types'
import UserMenu from '../components/UserMenu'

import '../styles/globals.css'
import styles from '../styles/App.module.css'

export default function App({
  Component,
  pageProps,
  userName,
}: ExtendedAppProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Also</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Link href="/">
          <h1 className={styles.title}>also</h1>
        </Link>
      </header>
      <nav>
        <UserMenu name={userName} />
      </nav>

      <main className={styles.main}>
        <Component {...pageProps} />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/dGrowl"
          target="_blank"
          rel="noopener noreferrer"
        >
          dGrowl@GitHub
        </a>
      </footer>
    </div>
  )
}

App.getInitialProps = async ({ ctx }: AppContext) => {
  let userName = null
  if (ctx.req) {
    const request = ctx.req as ExtendedRequest
    const token = request.cookies.auth
    if (token) {
      try {
        if (!process.env.JWT_AUTH_SECRET) {
          throw 'Environment is missing JWT secret'
        }
        const payload = jwt.verify(
          token,
          process.env.JWT_AUTH_SECRET
        ) as AuthPayload
        userName = payload.name
      } catch (error) {
        console.log(error)
      }
    }
  }
  return { userName }
}