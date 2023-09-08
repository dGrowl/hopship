import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../../lib/helpers'
import db from '../../../lib/db'

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { sub: userName } = payload
  const { platform, network, name: networkName, desc } = req.body
  try {
    await db.query(
      `
        INSERT INTO public.identities (
          user_id,
          platform,
          network,
          name,
          description
        )
        VALUES (
          (SELECT id FROM public.users WHERE name = $1),
          $2,
          $3,
          $4,
          $5
        );
      `,
      [userName, platform, network, networkName, desc]
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
    case 'POST':
      return create(req, res)
  }
  return res.status(405).json({})
}

export default handler
