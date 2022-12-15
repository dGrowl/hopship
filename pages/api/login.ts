import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'

import db from '../../lib/db'

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7

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
  const passhashQuery = await db.query(
    `
      SELECT u.tag, u.passhash
      FROM public.users u
      WHERE u.email = $1;
    `,
    [email]
  )
  if (passhashQuery.rowCount === 1) {
    const { tag, passhash } = passhashQuery.rows[0]
    if (passhash !== null) {
      try {
        if (!process.env.JWT_AUTH_SECRET) {
          throw 'Environment is missing JWT secret'
        }
        if (await argon2.verify(passhash, password)) {
          const token = jwt.sign({ tag }, process.env.JWT_AUTH_SECRET, {
            expiresIn: WEEK_IN_SECONDS,
          })
          const cookie = [
            `auth=${token}`,
            `Max-Age=${WEEK_IN_SECONDS}`,
            'HttpOnly',
            'Path=/',
            'SameSite=Lax',
          ]
          res.status(200).setHeader('Set-Cookie', cookie.join('; ')).json({})
          return
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
  res.status(401).json({
    message: "Provided account credentials don't match any known users",
  })
}
