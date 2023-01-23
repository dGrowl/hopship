import { JwtPayload } from 'jsonwebtoken'
import { AppProps } from 'next/app'
import { NextApiRequestCookies } from 'next/dist/server/api-utils'
import { NextIncomingMessage } from 'next/dist/server/request-meta'

export interface Identity {
  verified?: boolean
  platform: string
  name: string
  desc: string
}

export interface ExtendedAppProps extends AppProps {
  userName: string
}

export type ExtendedRequest = NextIncomingMessage & {
  cookies: NextApiRequestCookies
}

export interface AuthPayload extends JwtPayload {
  name: string
  email: string
}

export interface CSRFPayload extends JwtPayload {
  code: string
}

export interface CSRFFormFields {
  csrf: HTMLInputElement
}
