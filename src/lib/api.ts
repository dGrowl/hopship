import { NextRequest, NextResponse } from 'next/server'
import { TObject } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as jose from 'jose'
import argon2 from 'argon2'

import { hasKey } from './util'
import { JWT_AUTH_SECRET } from './env'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import db, { validateUserData } from '../lib/db'

export interface AuthPayload extends jose.JWTPayload {
  sub: string
  email: string
}

export interface CSRFPayload extends jose.JWTPayload {
  code: string
}

type JsonObject = { [key: string]: JsonValue }

type JsonValue = boolean | number | string | JsonObject | Array<JsonValue>

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
  body: JsonObject
  done: boolean
  options: ResponseInit
  cookies: Record<string, ResponseCookie>

  constructor() {
    this.done = false
    this.body = {}
    this.options = {}
    this.cookies = {}
  }

  send() {
    this.done = true
  }

  build() {
    const res = NextResponse.json(this.body, this.options)
    Object.values(this.cookies).forEach((c) => res.cookies.set(c))
    return res
  }
}

export const chain = (...handlers: Array<ChainedRouteHandler>) => {
  return async (req: NextRequest, extras: APIExtras) => {
    const res = new ResponseState()
    for (let handler of handlers) {
      if (res.done) {
        break
      }
      await handler(req, res, extras)
    }
    return res.build()
  }
}

export const checkCSRF = async (
  req: NextRequest,
  res: ResponseState,
  { auth }: APIExtras
) => {
  const cookie = req.cookies.get('csrf')
  try {
    if (!cookie) {
      throw 'Missing CSRF protection cookie'
    }
    const headerCode = req.headers.get('x-csrf-token')
    if (!headerCode) {
      throw 'Missing CSRF protection header'
    }
    const { payload } = await jose.jwtVerify<AuthPayload>(
      cookie.value,
      JWT_AUTH_SECRET
    )
    const { code: cookieCode, sub: csrfName } = payload
    if (headerCode !== cookieCode) {
      throw 'Mismatch between CSRF protection codes in cookie and header'
    }
    if (auth) {
      const { sub: authName } = auth
      if (!authName || !csrfName || authName !== csrfName) {
        throw 'Mismatch between name in auth and CSRF cookies'
      }
    }
  } catch (error) {
    console.error(error)
    res.body = { message: error as string }
    res.options = { status: 400 }
    return res.send()
  }
}

export const checkAuth = async (
  req: NextRequest,
  res: ResponseState,
  extras: APIExtras
) => {
  const cookie = req.cookies.get('auth')
  try {
    if (!cookie) {
      throw 'Request did not contain required auth cookie'
    }
    const { payload } = await jose.jwtVerify<AuthPayload>(
      cookie.value,
      JWT_AUTH_SECRET
    )
    if (!(await validateUserData(payload))) {
      throw 'Auth cookie contained inaccurate user data'
    }
    extras.auth = payload
  } catch (error) {
    console.error(error)
    res.body = { message: error as string }
    res.options = { status: 401 }
    return res.send()
  }
}

type UserResult =
  | {
      valid: true
      name: string
      passhash: string
    }
  | {
      valid: false
      error: 'WRONG_PASSWORD' | 'UNKNOWN_EMAIL'
    }

export const getUserData = async (
  email: string,
  password: string
): Promise<UserResult> => {
  const result = await db.query(
    `
      SELECT TRUE as valid, u.name, u.passhash
      FROM public.users u
      WHERE u.email = $1;
    `,
    [email]
  )
  if (result.rowCount === 1) {
    const data = result.rows[0]
    if (data.passhash !== null) {
      try {
        if (await argon2.verify(data.passhash, password)) {
          return data
        }
      } catch (error) {
        console.error(error)
      }
      return { valid: false, error: 'WRONG_PASSWORD' }
    }
  }
  return { valid: false, error: 'UNKNOWN_EMAIL' }
}

export const validateRequestBody = <T extends TObject>(structure: T) => {
  const validator = TypeCompiler.Compile(structure)
  return async (req: NextRequest, res: ResponseState, extras: APIExtras) => {
    let body = null
    try {
      body = (await req.json()) as T
      extras.body = body
    } catch (error) {
      res.body = { message: 'Body not valid JSON' }
      res.options = { status: 400 }
      return res.send()
    }
    const error = validator.Errors(body).First()
    if (error) {
      res.body = { message: error.message, path: error.path }
      res.options = { status: 400 }
      return res.send()
    }
    const unexpectedProperties = Object.keys(body).filter(
      (k) => !hasKey(structure.properties, k)
    )
    if (unexpectedProperties.length !== 0) {
      res.body = {
        message: 'Body contains unexpected properties',
        properties: unexpectedProperties,
      }
      res.options = { status: 400 }
      return res.send()
    }
  }
}
