import type { NextApiRequest, NextApiResponse } from 'next'

import db from '../../lib/db'
import { hasKey } from '../../lib/util'

const create = async (req: NextApiRequest, res: NextApiResponse) => {
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
  res.status(200).json({})
}

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  const { platform, name } = body
  if (hasKey(body, 'desc')) {
    const { desc } = body
    try {
      await db.query(
        `
          UPDATE public.identities i
          SET description = $1
          WHERE platform = $2
            AND name = $3;
        `,
        [desc, platform, name]
      )
    } catch (error) {
      console.log(error)
      res.status(500).json({})
      return
    }
  }
  res.status(200).json({})
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      create(req, res)
      break
    case 'PATCH':
      update(req, res)
      break
    default:
      res.status(405).json({})
  }
}
