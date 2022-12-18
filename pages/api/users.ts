import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import db from '../../lib/db'

const sanitizeTag = (tag: string) => tag.toLowerCase()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { body } = req
    let { email, tag, password } = body
    tag = sanitizeTag(tag)
    const passhash = await argon2.hash(password, {
      memoryCost: 16384, // 2^14
      timeCost: 64,
    })
    const result = await db.query(
      `
        INSERT INTO public.users (email, tag, passhash)
        VALUES ($1, $2, $3);
      `,
      [email, tag, passhash]
    )
    if (result.rowCount !== 1) {
      res.status(500).json({})
      return
    }
  }
  res.status(200).json({})
}
