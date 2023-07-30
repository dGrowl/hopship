import { Nunito_Sans } from 'next/font/google'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { NextIncomingMessage } from 'next/dist/server/request-meta'
import { useState } from 'react'
import Head from 'next/head'
import jwt from 'jsonwebtoken'
import Link from 'next/link'
import type { AppContext, AppProps } from 'next/app'

import { AuthPayload } from '../lib/types'
import { buildCookie, genHexString } from '../lib/util'
import SearchBar from '../components/SearchBar'
import UserMenu from '../components/UserMenu'

import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/variables.css'
import styles from '../styles/App.module.css'

const HALF_HOUR_IN_SECONDS = 60 * 30
const TITLE_FONT = Nunito_Sans({ subsets: ['latin'] })

interface HomeBarProps {
  userName: string
}

const HomeBar = ({ userName }: HomeBarProps) => {
  const [searching, setSearching] = useState(false)
  return (
    <header id={styles.header}>
      <div
        className={searching ? styles.expandMobile : ''}
        id={styles.headerContent}
      >
        <Link href="/" className={searching ? styles.hiddenForMobile : ''}>
          <h1 className={TITLE_FONT.className}>also</h1>
        </Link>
        <SearchBar searching={searching} setSearching={setSearching} />
        <UserMenu name={userName} searching={searching} />
      </div>
    </header>
  )
}

type Props = AppProps & HomeBarProps

export default function App({ Component, pageProps, userName }: Props) {
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>also</title>
          <meta
            name="description"
            content="A searchable index of user accounts across different web platforms. Come find all of your friends!"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <HomeBar userName={userName} />
        <main className={styles.main}>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  )
}

type ExtendedRequest = NextIncomingMessage & {
  cookies: NextApiRequestCookies
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
        console.error(error)
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
        ctx.res.setHeader(
          'Set-Cookie',
          buildCookie('csrf', csrfToken, HALF_HOUR_IN_SECONDS)
        )
      } catch (error) {
        console.error(error)
      }
    }
  }
  return { userName }
}
