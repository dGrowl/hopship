import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../../../server/helpers'
import { hasKey } from '../../../../lib/util'
import db from '../../../../server/db'

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { body, query } = req
  const { platform, id: platformName, verified } = query
  if (hasKey(body, 'desc')) {
    const { desc } = body
    const table = verified === 'true' ? 'identities' : 'unverified_identities'
    try {
      await db.query(
        `
          UPDATE public.${table}
          SET description = $4
          WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
            AND platform = $2
            AND name = $3;
        `,
        [userName, platform, platformName, desc]
      )
    } catch (error) {
      console.log(error)
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
  const { platform, id: platformName, verified } = query
  const table = verified === 'true' ? 'identities' : 'unverified_identities'
  try {
    await db.query(
      `
      DELETE FROM public.${table}
      WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
        AND platform = $2
        AND name = $3;
    `,
      [userName, platform, platformName]
    )
  } catch (error) {
    console.log(error)
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
