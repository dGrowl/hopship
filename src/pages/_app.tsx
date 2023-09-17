import { BsMoonFill, BsRocketFill, BsSlash, BsStars } from 'react-icons/bs'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { NextIncomingMessage } from 'next/dist/server/request-meta'
import { Nunito_Sans } from 'next/font/google'
import { ServerResponse } from 'http'
import { useState } from 'react'
import Head from 'next/head'
import jwt from 'jsonwebtoken'
import Link from 'next/link'
import type { AppContext, AppProps } from 'next/app'

import { AuthPayload, CSRFPayload } from '../lib/types'
import { buildCookie, genHexString, secsRemaining } from '../lib/util'
import { JWT_AUTH_SECRET } from '../lib/env'
import SearchBar from '../components/SearchBar'
import UserMenu from '../components/UserMenu'

import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/variables.css'
import styles from '../styles/App.module.css'

const THREE_HOURS_IN_SECONDS = 60 /* secs */ * 60 /* mins */ * 3 /* hrs */
const SIX_HOURS_IN_SECONDS = THREE_HOURS_IN_SECONDS * 2
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
          <h1 className={TITLE_FONT.className}>hopship</h1>
        </Link>
        <SearchBar searching={searching} setSearching={setSearching} />
        <UserMenu name={userName} searching={searching} />
      </div>
    </header>
  )
}

const backdrop = (
  <div id={styles.backdrop}>
    <BsMoonFill id={styles.moon} />
    <BsStars id={styles.stars} />
    <BsRocketFill id={styles.ship} />
  </div>
)

type Props = AppProps & HomeBarProps

export default function App({ Component, pageProps, userName }: Props) {
  return (
    <>
      <Head>
        <title>hopship</title>
        <meta
          name="description"
          content="A searchable index of user accounts across different web platforms. Come find all of your friends!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {backdrop}
      <HomeBar userName={userName} />
      <main className={styles.main}>
        <Component {...pageProps} />
      </main>
      <footer id={styles.footer}>
        <div>
          <Link href="/about/mission">about</Link>
          <BsSlash size={48} />
          <Link href="/about/help">help</Link>
          <BsSlash size={48} />
          <Link href="/about/privacy">privacy</Link>
        </div>
      </footer>
    </>
  )
}

type RequestWithCookies = NextIncomingMessage & {
  cookies: NextApiRequestCookies
}

const extractAuthName = (authToken: string | undefined) => {
  if (!authToken) {
    return null
  }
  const payload = jwt.verify(authToken, JWT_AUTH_SECRET) as AuthPayload
  return payload.sub
}

const addCSRFCookie = (userName: string | null, response: ServerResponse) => {
  const code = genHexString(32)
  const options = { expiresIn: SIX_HOURS_IN_SECONDS } as jwt.SignOptions
  if (userName) {
    options.subject = userName
  }
  const csrfToken = jwt.sign({ code }, JWT_AUTH_SECRET, options)
  response.setHeader(
    'Set-Cookie',
    buildCookie('csrf', csrfToken, SIX_HOURS_IN_SECONDS)
  )
}

const checkCSRFCookie = (
  req: RequestWithCookies,
  res: ServerResponse,
  userName: string | null
) => {
  if (req.cookies.csrf) {
    try {
      const payload = jwt.verify(
        req.cookies.csrf,
        JWT_AUTH_SECRET
      ) as CSRFPayload
      if (payload.exp && secsRemaining(payload.exp) < THREE_HOURS_IN_SECONDS) {
        addCSRFCookie(userName, res)
      }
    } catch (error) {
      addCSRFCookie(userName, res)
    }
  } else {
    addCSRFCookie(userName, res)
  }
}

App.getInitialProps = async ({ ctx }: AppContext) => {
  const { req, res } = ctx
  let userName = null
  if (req && res) {
    try {
      const request = req as RequestWithCookies
      userName = extractAuthName(request.cookies.auth)
      checkCSRFCookie(request, res, userName)
    } catch (error) {
      console.error(error)
    }
  }
  return { userName }
}
