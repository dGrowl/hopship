import type { NextApiRequest, NextApiResponse } from 'next'

import db from '../../lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { body } = req
    const { user_name, platform, platform_name, desc } = body
    try {
      await db.query('CALL add_identity($1, $2, $3, $4);', [
        user_name,
        platform,
        platform_name,
        desc,
      ])
    } catch (error) {
      console.log(error)
      res.status(500).json({})
      return
    }
  }
  res.status(200).json({})
}
