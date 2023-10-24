'use server'

import { cookies } from 'next/headers'
import * as jose from 'jose'

import { JWT_AUTH_SECRET } from './env'
import { validateUserData } from './db'

export const extractAuth = async () => {
  const cookieStore = cookies()
  const authToken = cookieStore.get('auth')
  if (!authToken) {
    return null
  }
  try {
    const { payload } = await jose.jwtVerify(authToken.value, JWT_AUTH_SECRET)
    if (await validateUserData(payload)) {
      return {
        name: payload.sub as string,
        email: payload.email as string,
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}
