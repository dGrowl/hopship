import { NextResponse } from 'next/server'
import * as jose from 'jose'
import type { NextRequest } from 'next/server'

import { genHexString, secsRemaining } from './lib/util'
import { JWT_AUTH_SECRET } from './lib/env'

const THREE_HOURS_IN_SECONDS = 60 /* secs */ * 60 /* mins */ * 3 /* hrs */
const SIX_HOURS_IN_SECONDS = THREE_HOURS_IN_SECONDS * 2

interface AuthState {
  name: string | null
  processed: boolean
}

const processAuth = async (req: NextRequest, authState: AuthState) => {
  if (authState.processed) return
  const authCookie = req.cookies.get('auth')
  if (authCookie) {
    try {
      const { payload } = await jose.jwtVerify(
        authCookie.value,
        JWT_AUTH_SECRET
      )
      authState.name = payload.sub || null
      authState.processed = true
    } catch (error) {
      console.error(error)
    }
  }
}

const addCSRFCookie = async (
  req: NextRequest,
  res: NextResponse,
  authState: AuthState
) => {
  if (!authState.processed) {
    await processAuth(req, authState)
  }
  const code = genHexString(32)
  const claims = { code } as jose.JWTPayload
  if (authState.name) {
    claims.sub = authState.name
  }
  try {
    const csrfToken = await new jose.SignJWT(claims)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('6h')
      .sign(JWT_AUTH_SECRET)
    res.cookies.set('csrf', csrfToken, {
      maxAge: SIX_HOURS_IN_SECONDS,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV !== 'development',
    })
  } catch (error) {
    console.log(error)
  }
}

const checkCSRFCookie = async (
  req: NextRequest,
  res: NextResponse,
  authState: AuthState
) => {
  const csrfCookie = req.cookies.get('csrf')
  if (!csrfCookie) {
    return addCSRFCookie(req, res, authState)
  }
  try {
    const { payload } = await jose.jwtVerify(csrfCookie.value, JWT_AUTH_SECRET)
    if (payload.exp && secsRemaining(payload.exp) < THREE_HOURS_IN_SECONDS) {
      return addCSRFCookie(req, res, authState)
    }
  } catch (error) {
    console.error(error)
    return addCSRFCookie(req, res, authState)
  }
}

interface RedirectRule {
  auth: boolean
  path: string
}

const redirects: Record<string, RedirectRule | undefined> = {
  settings: {
    auth: true,
    path: '/login',
  },
  login: {
    auth: false,
    path: '/settings',
  },
} as const

const checkAuthRedirect = async (req: NextRequest, authState: AuthState) => {
  // [protocol, domain, ...path]
  const components = req.url.split(/\/+/)
  const page = components[2]
  const rule = redirects[page]
  if (rule) {
    await processAuth(req, authState)
    if (rule.auth !== !!authState.name) {
      const url = req.nextUrl.clone()
      url.pathname = rule.path
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const middleware = async (req: NextRequest) => {
  const authState = { name: null, processed: false }
  const res = await checkAuthRedirect(req, authState)
  await checkCSRFCookie(req, res, authState)
  return res
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
