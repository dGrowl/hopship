import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../lib/helpers'
import db from '../../lib/db'

const verify = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { sub: userName } = payload
  const { network, name: networkName, timestampMs, proof } = req.body
  try {
    await db.query(
      `
        WITH v as (
          INSERT INTO public.verifications (user_id, network, name, requested_at, proof)
          VALUES (
            (SELECT id FROM public.users WHERE name = $1),
            $2,
            $3,
            to_timestamp($4),
            $5
          )
          RETURNING user_id
        )
        UPDATE public.identities
        SET status = 'PENDING'
        WHERE user_id = (SELECT user_id FROM v)
          AND network = $2
          AND name = $3
          AND (
            status = 'UNVERIFIED'
            OR status = 'REJECTED'
          );
      `,
      [userName, network, networkName, timestampMs, JSON.stringify(proof)]
    )
  } catch (error) {
    console.error(error)
    return res.status(400).json({})
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await checkCSRF(req, res))) return
  switch (req.method) {
    case 'POST':
      return verify(req, res)
  }
  return res.status(405).json({})
}

export default handler
