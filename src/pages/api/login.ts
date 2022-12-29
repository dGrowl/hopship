import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'

import { clamp } from '../../lib/util'
import db from '../../lib/db'

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7

export const genAuthCookie = (
  name: string,
  email: string,
  expirationSecs: number = WEEK_IN_SECONDS
) => {
  if (!process.env.JWT_AUTH_SECRET) {
    throw {
      message:
        'Failed to generate auth cookie (server environment missing auth secret)',
    }
  }
  expirationSecs = Math.floor(expirationSecs)
  expirationSecs = clamp(expirationSecs, 0, WEEK_IN_SECONDS)
  const token = jwt.sign({ name, email }, process.env.JWT_AUTH_SECRET, {
    expiresIn: expirationSecs,
  })
  const cookie = [
    `auth=${token}`,
    `Max-Age=${expirationSecs}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
  ]
  return cookie.join('; ')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != 'POST') {
    res
      .status(405)
      .json({ message: 'Route /api/login only accepts POST requests' })
    return
  }
  const { body } = req
  const { email, password } = body
  const passhashResult = await db.query(
    `
      SELECT u.name, u.passhash
      FROM public.users u
      WHERE u.email = $1;
    `,
    [email]
  )
  if (passhashResult.rowCount === 1) {
    const { name, passhash } = passhashResult.rows[0]
    if (passhash !== null) {
      try {
        if (!process.env.JWT_AUTH_SECRET) {
          throw 'Environment is missing JWT secret'
        }
        if (await argon2.verify(passhash, password)) {
          const cookie = genAuthCookie(name, email)
          return res.status(200).setHeader('Set-Cookie', cookie).json({})
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
  return res.status(401).json({
    message: "Provided account credentials don't match any known users",
  })
}
