import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

import { AuthPayload, CSRFPayload } from './types'
import { JWT_AUTH_SECRET } from './env'
import { validateUserData } from './db'

export const processAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { auth: token } = req.cookies
  if (!token) {
    res.status(401).json({
      message: 'Request did not contain required auth cookie',
    })
    return null
  }
  try {
    const payload = jwt.verify(token, JWT_AUTH_SECRET) as AuthPayload
    if (!(await validateUserData(payload))) {
      throw 'Auth cookie contained inaccurate user data'
    }
    return payload
  } catch (error) {
    console.error(error)
    res
      .status(401)
      .json({ message: 'Request contained an invalid auth cookie' })
  }
  return null
}

export const checkCSRF = (
  req: NextApiRequest,
  res: NextApiResponse,
  checkAuth: boolean = true
) => {
  const { csrf: csrfCookie, auth: authCookie } = req.cookies
  if (!csrfCookie) {
    res.status(400).json({
      message: 'Missing CSRF protection cookie',
    })
    return false
  }
  if (checkAuth && !authCookie) {
    res.status(400).json({
      message: 'Missing auth cookie',
    })
    return false
  }
  const headerCode = req.headers['x-csrf-token']
  if (!headerCode) {
    res.status(400).json({
      message: 'Missing CSRF protection header',
    })
    return false
  }
  try {
    const { code: cookieCode, sub: csrfName } = jwt.verify(
      csrfCookie,
      JWT_AUTH_SECRET
    ) as CSRFPayload
    if (headerCode !== cookieCode) {
      res.status(400).json({
        message: 'Mismatch between CSRF protection codes in cookie and header',
      })
      return false
    }
    if (checkAuth) {
      const { sub: authName } = jwt.decode(authCookie || '') as AuthPayload
      if (!authName || !csrfName || authName !== csrfName) {
        res.status(400).json({
          message: 'Mismatch between name in auth and CSRF cookies',
        })
        return false
      }
    }
  } catch (error) {
    console.error(error)
    res.status(400).json({
      message: 'Invalid CSRF protection cookie',
    })
    return false
  }
  return true
}
