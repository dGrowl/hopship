import { NextRequest, NextResponse } from 'next/server'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import * as jose from 'jose'

import { JsonObject } from '../lib/types'
import { JWT_AUTH_SECRET } from '../lib/env'

export const cookies = {
  auth: '',
  authB: '',
  csrf: '',
  csrfB: '',
  csrfNoSub: '',
}

export const codes = {
  csrf: 'f424145bf229f32d',
  csrfB: 'bf336e029bf6b61a',
}

export class RequestState {
  private cookies: Record<string, RequestCookie>
  private fn: (req: NextRequest) => Promise<NextResponse>
  private headers: Headers
  private path: string
  private verb: string

  constructor() {
    this.cookies = {}
    this.fn = async () => NextResponse.json({})
    this.headers = new Headers()
    this.path = 'http://localhost:3000'
    this.verb = 'GET'
  }

  handler(handler: (req: NextRequest) => Promise<NextResponse>) {
    this.fn = handler
    return this
  }

  route(route: string) {
    this.path = `http://localhost:3000${route}`
    return this
  }

  method(method: string) {
    this.verb = method
    return this
  }

  header(name: string, value: string | null) {
    if (value === null) {
      this.headers.delete(name)
    } else {
      this.headers.set(name, value)
    }
    return this
  }

  cookie(name: string, value: string | null, options: object = {}) {
    if (value === null) {
      delete this.cookies[name]
    } else {
      const cookie = { name, value, ...options }
      this.cookies[name] = cookie
    }
    return this
  }

  send(body?: JsonObject) {
    const req = new NextRequest(this.path, {
      method: this.verb,
      headers: this.headers,
      body: body ? JSON.stringify(body) : null,
    })
    Object.values(this.cookies).forEach((c) => req.cookies.set(c))
    return this.fn(req)
  }
}

const signTestJwt = (payload: jose.JWTPayload) =>
  new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_AUTH_SECRET)

const initCookies = async () => {
  cookies.auth = await signTestJwt({
    sub: 'tester',
    email: 'tester@e.mail',
  })
  cookies.authB = await signTestJwt({
    sub: 'otherTester',
    email: 'otherTester@e.mail',
  })
  cookies.csrf = await signTestJwt({
    sub: 'tester',
    code: codes.csrf,
  })
  cookies.csrfB = await signTestJwt({
    sub: 'otherTester',
    code: codes.csrfB,
  })
  cookies.csrfNoSub = await signTestJwt({
    code: codes.csrf,
  })
}

initCookies()
