import { NextResponse, NextRequest } from 'next/server'
import * as jose from 'jose'

import { AuthPayload, CSRFPayload } from './lib/api'
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
  authState.processed = true
  if (authCookie) {
    try {
      const { payload } = await jose.jwtVerify<AuthPayload>(
        authCookie.value,
        JWT_AUTH_SECRET
      )
      authState.name = payload.sub || null
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
  await processAuth(req, authState)
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
    console.error(error)
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
    const { payload } = await jose.jwtVerify<CSRFPayload>(
      csrfCookie.value,
      JWT_AUTH_SECRET
    )
    if (payload.exp && secsRemaining(payload.exp) < THREE_HOURS_IN_SECONDS) {
      return addCSRFCookie(req, res, authState)
    }
  } catch (error) {
    console.error(error)
    return addCSRFCookie(req, res, authState)
  }
}

interface RedirectRule {
  whenAuthed: boolean
  path: string
}

const redirects: Record<string, RedirectRule | undefined> = {
  settings: {
    whenAuthed: false,
    path: '/login',
  },
  login: {
    whenAuthed: true,
    path: '/settings/identities',
  },
} as const

const checkAuthRedirect = async (req: NextRequest, authState: AuthState) => {
  // [protocol, domain, ...path]
  const components = req.url.split(/\/+/)
  const page = components[2]
  const rule = redirects[page]
  if (rule) {
    await processAuth(req, authState)
    if (rule.whenAuthed === !!authState.name) {
      const url = req.nextUrl.clone()
      url.pathname = rule.path
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

const handleLogout = async (req: NextRequest) => {
  const res = NextResponse.next()
  res.cookies.set('auth', 'none', {
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
  })
  await addCSRFCookie(req, res, { name: null, processed: true })
  return res
}

export const middleware = async (req: NextRequest) => {
  if (req.nextUrl.pathname.startsWith('/logout')) {
    return handleLogout(req)
  }
  const authState = { name: null, processed: false }
  const res = await checkAuthRedirect(req, authState)
  await checkCSRFCookie(req, res, authState)
  return res
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
