import { NextRequest, NextResponse } from 'next/server'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { TObject } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as jose from 'jose'
import argon2 from 'argon2'

import { hasKey } from './util'
import { JsonObject } from './types'
import { JWT_AUTH_SECRET } from './env'
import db, { validateUserData } from 'lib/db'

export interface AuthPayload extends jose.JWTPayload {
  sub: string
  email: string
}

export interface CSRFPayload extends jose.JWTPayload {
  code: string
}

export interface APIExtras {
  auth?: AuthPayload
  body?: JsonObject
  params?: Record<string, string>
}

type ChainedRouteHandler = (
  req: NextRequest,
  res: ResponseState,
  extras: APIExtras
) => Promise<void>

export class ResponseState {
  private body: JsonObject | null
  private cookies: Record<string, ResponseCookie>
  private done: boolean
  private headers: Headers
  private options: ResponseInit

  constructor() {
    this.body = null
    this.cookies = {}
    this.done = false
    this.headers = new Headers()
    this.options = {}
  }

  header(name: string, value: string) {
    this.headers.set(name, value)
    return this
  }

  cookie(name: string, value: ResponseCookie) {
    this.cookies[name] = value
    return this
  }

  status(code: number) {
    this.options = { ...this.options, status: code }
    return this
  }

  send(body?: JsonObject) {
    if (body) {
      this.body = body
    }
    this.done = true
  }

  build() {
    this.options.headers = this.headers
    const res = this.body
      ? NextResponse.json(this.body, this.options)
      : new NextResponse<null>(null, this.options)
    Object.values(this.cookies).forEach((c) => res.cookies.set(c))
    return res
  }

  isDone() {
    return this.done
  }
}

export const chain = (...handlers: Array<ChainedRouteHandler>) => {
  return async (req: NextRequest, extras: APIExtras = {}) => {
    const res = new ResponseState()
    for (const handler of handlers) {
      if (res.isDone()) {
        break
      }
      await handler(req, res, extras)
    }
    return res.build()
  }
}

export const checkCSRF: ChainedRouteHandler = async (req, res, { auth }) => {
  const cookie = req.cookies.get('csrf')
  if (!cookie) {
    return res.status(400).send({ error: 'CSRF_NO_COOKIE' })
  }
  const headerCode = req.headers.get('x-csrf-token')
  if (!headerCode) {
    return res.status(400).send({ error: 'CSRF_NO_HEADER' })
  }
  let cookieCode, csrfName
  try {
    const { payload } = await jose.jwtVerify<CSRFPayload>(
      cookie.value,
      JWT_AUTH_SECRET
    )
    cookieCode = payload.code
    csrfName = payload.sub
  } catch (error) {
    console.error(error)
    return res.status(400).send({ error: 'CSRF_VERIFY_FAILED' })
  }
  if (!cookieCode) {
    return res.status(400).send({ error: 'CSRF_COOKIE_MISSING_CODE' })
  }
  if (headerCode !== cookieCode) {
    return res.status(400).send({ error: 'CSRF_COOKIE_HEADER_MISMATCH' })
  }
  if (auth) {
    const { sub: authName } = auth
    if (!authName || !csrfName || authName !== csrfName) {
      return res.status(400).send({ error: 'CSRF_AUTH_MISMATCH' })
    }
  }
}

export const checkAuth: ChainedRouteHandler = async (req, res, extras) => {
  const cookie = req.cookies.get('auth')
  if (!cookie) {
    return res.status(401).send({ error: 'AUTH_NO_COOKIE' })
  }
  try {
    const { payload } = await jose.jwtVerify<AuthPayload>(
      cookie.value,
      JWT_AUTH_SECRET
    )
    if (!(await validateUserData(payload))) {
      return res.status(401).send({ error: 'AUTH_BAD_PAYLOAD' })
    }
    extras.auth = payload
  } catch (error) {
    console.error(error)
    return res.status(401).send({ error: 'AUTH_VERIFY_FAILED' })
  }
}

type UserResult =
  | {
      valid: true
      name: string
    }
  | {
      valid: false
      error: 'WRONG_PASSWORD' | 'UNKNOWN_EMAIL'
    }

export const getUserData = async (
  email: string,
  password: string
): Promise<UserResult> => {
  const result = await db.query<{ name: string; passhash: string }>(
    `
      SELECT u.name, u.passhash
      FROM public.users u
      WHERE u.email = $1;
    `,
    [email]
  )
  if (result.rowCount === 1) {
    const { name, passhash } = result.rows[0]
    try {
      if (await argon2.verify(passhash, password)) {
        return { valid: true, name }
      }
    } catch (error) {
      console.error(error)
    }
    return { valid: false, error: 'WRONG_PASSWORD' }
  }
  return { valid: false, error: 'UNKNOWN_EMAIL' }
}

export const validateRequestBody = <T extends TObject>(structure: T) => {
  const validator = TypeCompiler.Compile(structure)
  return async (req: NextRequest, res: ResponseState, extras: APIExtras) => {
    let body = null
    try {
      body = await req.json()
      extras.body = body
    } catch (error) {
      return res.status(400).send({ error: 'BODY_INVALID_JSON' })
    }
    const error = validator.Errors(body).First()
    if (error) {
      return res
        .status(400)
        .send({ message: error.message, property: error.path })
    }
    const unexpectedProperties = Object.keys(body).filter(
      (k) => !hasKey(structure.properties, k)
    )
    if (unexpectedProperties.length !== 0) {
      return res.status(400).send({
        error: 'BODY_UNEXPECTED_PROPERTIES',
        properties: unexpectedProperties,
      })
    }
  }
}
