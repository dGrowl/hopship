import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import db from '../../lib/db'

const sanitizeName = (name: string) => name.toLowerCase()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { body } = req
    let { email, name, password } = body
    name = sanitizeName(name)
    const passhash = await argon2.hash(password, {
      memoryCost: 16384, // 2^14
      timeCost: 64,
    })
    const result = await db.query(
      `
        INSERT INTO public.users (email, name, passhash)
        VALUES ($1, $2, $3);
      `,
      [email, name, passhash]
    )
    if (result.rowCount !== 1) {
      res.status(500).json({})
      return
    }
  }
  res.status(200).json({})
}
