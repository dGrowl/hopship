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
    return res.status(500).json({})
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
          SET i.description = $1
          WHERE i.platform = $2
            AND i.name = $3;
        `,
        [desc, platform, name]
      )
    } catch (error) {
      console.log(error)
      return res.status(500).json({})
    }
  }
  res.status(200).json({})
}

const remove = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  const { platform, name } = body
  try {
    await db.query(
      `
        DELETE FROM public.identities i
        WHERE i.platform = $1
          AND i.name = $2;
      `,
      [platform, name]
    )
  } catch (error) {
    console.log(error)
    return res.status(500).json({})
  }
  res.status(200).json({})
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      return create(req, res)
    case 'PATCH':
      return update(req, res)
    case 'DELETE':
      return remove(req, res)
  }
  res.status(405).json({})
}
