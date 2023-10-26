import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF } from '../../lib/helpers'
import db from '../../lib/db'

const contact = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, message } = req.body
  try {
    await db.query(
      `
        INSERT INTO public.admin_messages (email, message)
        VALUES ($1, $2)
      `,
      [email || null, message]
    )
  } catch (error) {
    console.error(error)
    return res.status(400).json({})
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await checkCSRF(req, res, false))) return
  switch (req.method) {
    case 'POST':
      return contact(req, res)
  }
  return res.status(405).json({})
}

export default handler
