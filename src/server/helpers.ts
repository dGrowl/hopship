import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

import { AuthPayload, CSRFPayload } from '../lib/types'
import db from './db'

export const validateUserData = async (payload: AuthPayload) => {
  const { name, email } = payload
  const result = await db.query(
    `
      SELECT true
      FROM public.users
      WHERE name = $1
        AND email = $2;
    `,
    [name, email]
  )
  return result.rowCount === 1
}

export const processAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (!process.env.JWT_AUTH_SECRET) {
    res.status(500).json({ message: 'Server environment missing auth secret' })
    return null
  }
  const { auth: token } = req.cookies
  if (!token) {
    res.status(401).json({
      message: 'Request did not contain required auth cookie',
    })
    return null
  }
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_AUTH_SECRET
    ) as AuthPayload
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

export const checkCSRF = (req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.JWT_AUTH_SECRET) {
    res.status(500).json({
      message: 'Server environment missing token secret',
    })
    return false
  }
  const cookie = req.cookies.csrf
  if (!cookie) {
    res.status(400).json({
      message: 'Missing CSRF protection cookie',
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
    const { code: cookieCode } = jwt.verify(
      cookie,
      process.env.JWT_AUTH_SECRET
    ) as CSRFPayload
    if (headerCode !== cookieCode) {
      res.status(400).json({
        message: 'Mismatch between CSRF protection codes in cookie and header',
      })
      return false
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
