import { JwtPayload } from 'jsonwebtoken'
import { AppProps } from 'next/app'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { NextIncomingMessage } from 'next/dist/server/request-meta'

export interface Identity {
  platform: string
  id: string
  desc: string
}

export interface ExtendedAppProps extends AppProps {
  userTag: string
}

export type ExtendedRequest = NextIncomingMessage & {
  cookies: NextApiRequestCookies
}

export interface AuthPayload extends JwtPayload {
  tag: string
}
