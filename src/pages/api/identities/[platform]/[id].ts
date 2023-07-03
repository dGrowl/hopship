import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../../../server/helpers'
import { hasKey } from '../../../../lib/util'
import db from '../../../../server/db'

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { body, query } = req
  const { platform, id: platformName } = query
  if (hasKey(body, 'desc')) {
    const { desc } = body
    try {
      await db.query(
        `
          UPDATE public.identities
          SET description = $4
          WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
            AND platform = $2
            AND name = $3;
        `,
        [userName, platform, platformName, desc]
      )
    } catch (error) {
      console.error(error)
      return res.status(500).json({})
    }
  }
  return res.status(200).json({})
}

const remove = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { query } = req
  const { platform, id: platformName } = query
  try {
    await db.query(
      `
        DELETE FROM public.identities
        WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
          AND platform = $2
          AND name = $3;
      `,
      [userName, platform, platformName]
    )
  } catch (error) {
    console.error(error)
    return res.status(500).json({})
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkCSRF(req, res)) return
  switch (req.method) {
    case 'PATCH':
      return update(req, res)
    case 'DELETE':
      return remove(req, res)
  }
  return res.status(405).json({})
}

export default handler
