import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../server/helpers'
import db from '../../server/db'

const verify = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { platform, name: platformName, timestampMs, proof } = req.body
  try {
    await db.query(
      `
        UPDATE public.identities
        SET status = 'PENDING',
          proof = $5,
          requested_at = to_timestamp($4)
        WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
          AND platform = $2
          AND name = $3
          AND (
            status = 'UNVERIFIED'
            OR status = 'REJECTED'
          );
      `,
      [userName, platform, platformName, timestampMs, JSON.stringify(proof)]
    )
  } catch (error) {
    console.error(error)
    return res.status(400).json({})
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkCSRF(req, res)) return
  switch (req.method) {
    case 'POST':
      return verify(req, res)
  }
  return res.status(405).json({})
}

export default handler
