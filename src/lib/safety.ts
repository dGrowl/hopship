import { NextApiRequest, NextApiResponse } from 'next'
import { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'

import { AuthPayload, CSRFPayload } from './types'
import { platforms } from './util'

export const processAuth = (req: NextApiRequest, res: NextApiResponse) => {
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
    const payload = jwt.verify(token, process.env.JWT_AUTH_SECRET)
    return payload as AuthPayload
  } catch (error) {
    console.log(error)
    res
      .status(401)
      .json({ message: 'Request contained an invalid auth cookie' })
  }
  return null
}

const csrfCookieRegex = /csrf=([a-zA-Z0-9-_.]+)/

export const useCSRFCode = () => {
  const [code, setCode] = useState('')
  useEffect(() => {
    const match = document.cookie.match(csrfCookieRegex)
    const token = match ? match[1] : null
    if (!token) return
    try {
      const payload = jwt.decode(token) as CSRFPayload | null
      setCode(payload?.code || '')
    } catch (error) {
      console.log('Error')
    }
  }, [])
  return code
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
    console.log(error)
    res.status(400).json({
      message: 'Invalid CSRF protection cookie',
    })
    return false
  }
  return true
}

export const MAX_PLATFORM_LENGTH = platforms.reduce(
  (len, p) => (p.length > len ? p.length : len),
  0
)

export const MAX_NAME_LENGTH = 64
