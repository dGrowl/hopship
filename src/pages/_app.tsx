import Head from 'next/head'
import jwt from 'jsonwebtoken'
import Link from 'next/link'
import type { AppContext } from 'next/app'

import { AuthPayload, ExtendedAppProps, ExtendedRequest } from '../lib/types'
import { genHexString } from '../lib/util'
import UserMenu from '../components/UserMenu'

import '../styles/reset.css'
import '../styles/globals.css'
import styles from '../styles/App.module.css'

const HALF_HOUR_IN_SECONDS = 60 * 30

export default function App({
  Component,
  pageProps,
  userName,
}: ExtendedAppProps) {
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Also</title>
          <meta
            name="description"
            content="A searchable index of user accounts across different web platforms. Come find all of your friends!"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header id={styles.header}>
          <Link href="/">
            <h1 className={styles.title}>also</h1>
          </Link>
          <UserMenu name={userName} />
        </header>

        <main className={styles.main}>
          <Component {...pageProps} />
        </main>
      </div>
      <footer className={styles.footer}>
        <a
          href="https://github.com/dGrowl"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub // dGrowl
        </a>
      </footer>
    </>
  )
}

App.getInitialProps = async ({ ctx }: AppContext) => {
  let userName = null
  if (ctx.req) {
    const request = ctx.req as ExtendedRequest
    const authToken = request.cookies.auth
    if (authToken) {
      try {
        if (!process.env.JWT_AUTH_SECRET) {
          throw 'Environment is missing JWT secret'
        }
        const payload = jwt.verify(
          authToken,
          process.env.JWT_AUTH_SECRET
        ) as AuthPayload
        userName = payload.name
      } catch (error) {
        console.log(error)
      }
    }
    if (!request.cookies.csrf && ctx.res) {
      try {
        if (!process.env.JWT_AUTH_SECRET) {
          throw 'Environment is missing JWT secret'
        }
        const code = genHexString(32)
        const csrfToken = jwt.sign({ code }, process.env.JWT_AUTH_SECRET, {
          expiresIn: HALF_HOUR_IN_SECONDS,
        })
        const cookie = [
          `csrf=${csrfToken}`,
          `Max-Age=${HALF_HOUR_IN_SECONDS}`,
          'Path=/',
          'SameSite=Lax',
          'Secure',
        ]
        ctx.res.setHeader('Set-Cookie', cookie.join('; '))
      } catch (error) {
        console.log(error)
      }
    }
  }
  return { userName }
}
