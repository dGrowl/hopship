import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../lib/safety'
import db from '../../lib/db'

const verify = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!processAuth(req, res)) return
  const { platform, name } = req.body
  try {
    await db.query(
      `
        WITH identity AS (
          DELETE FROM public.unverified_identities
          WHERE platform = $1
          AND name = $2
          RETURNING *
        )
        INSERT INTO public.identities
        SELECT * FROM identity;
      `,
      [platform, name]
    )
  } catch (error) {
    console.log(error)
    return res.status(400).json({})
  }
  return res.status(200).json({})
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkCSRF(req, res)) return
  switch (req.method) {
    case 'POST':
      return verify(req, res)
  }
  return res.status(405).json({})
}
