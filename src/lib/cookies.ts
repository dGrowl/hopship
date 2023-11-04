'use server'

import { cookies } from 'next/headers'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import * as jose from 'jose'

import { AuthPayload } from './api'
import { JWT_AUTH_SECRET } from './env'
import { validateUserData } from './db'

export const extractAuth = async () => {
  const cookieStore = cookies()
  const authToken = cookieStore.get('auth')
  if (!authToken) {
    return null
  }
  try {
    const { payload } = await jose.jwtVerify<AuthPayload>(
      authToken.value,
      JWT_AUTH_SECRET
    )
    if (await validateUserData(payload)) {
      return {
        name: payload.sub,
        email: payload.email,
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

export const genAuthCookie = async (
  name: string,
  email: string,
  expirationSecs: number
) => {
  const claims = { sub: name, email }
  const token = await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expirationSecs)
    .sign(JWT_AUTH_SECRET)
  return {
    name: 'auth',
    value: token,
    expires: expirationSecs * 1000, // ms
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
  } as ResponseCookie
}
