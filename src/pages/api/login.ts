import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'

import { buildCookie, clamp } from '../../lib/util'
import { checkCSRF } from '../../server/helpers'
import db from '../../server/db'

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
  return buildCookie('auth', token, expirationSecs)
}

export const getUserData = async (email: string, password: string) => {
  const result = await db.query(
    `
      SELECT u.name, u.passhash
      FROM public.users u
      WHERE u.email = $1;
    `,
    [email]
  )
  if (result.rowCount === 1) {
    const data = result.rows[0]
    if (data.passhash !== null) {
      try {
        if (!process.env.JWT_AUTH_SECRET) {
          throw 'Environment is missing JWT secret'
        }
        if (await argon2.verify(data.passhash, password)) {
          return data
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
  return null
}

const authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  const { email, password } = body
  const user = await getUserData(email, password)
  if (user) {
    const cookie = genAuthCookie(user.name, email)
    return res.status(200).setHeader('Set-Cookie', cookie).json({})
  }
  return res.status(401).json({
    message: "Provided account credentials don't match any known users",
  })
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkCSRF(req, res)) return
  switch (req.method) {
    case 'POST':
      return authenticate(req, res)
  }
  return res.status(405).json({})
}

export default handler
