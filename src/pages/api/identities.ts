import type { NextApiRequest, NextApiResponse } from 'next'

import db from '../../lib/db'
import { processAuth } from '../../lib/safety'
import { hasKey } from '../../lib/util'

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = processAuth(req, res)
  if (!payload) return
  const { name: user_name } = payload
  const { platform, name: platform_name, desc } = req.body
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
          UPDATE public.identities
          SET description = $1
          WHERE platform = $2
            AND name = $3;
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
  const payload = processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { body } = req
  const { platform, name: platformName, verified } = body
  try {
    await db.query('CALL delete_identity($1, $2, $3, $4);', [
      userName,
      platform,
      platformName,
      verified,
    ])
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
