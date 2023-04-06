import { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'

import { CSRFPayload } from './types'
import { platforms } from './util'

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

export const MIN_PASSWORD_LENGTH = 8

export const MAX_PASSWORD_LENGTH = 4096

export const MAX_USER_NAME_LENGTH = 24

export const MAX_PLATFORM_LENGTH = platforms.reduce(
  (len, p) => (p.length > len ? p.length : len),
  0
)

export const MAX_PLATFORM_NAME_LENGTH = 64

export const MAX_DESCRIPTION_LENGTH = 48
