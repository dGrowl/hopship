import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import {
  ARGON_OPTIONS,
  buildPostgresErrorJson,
  sanitizeName,
} from '../../../lib/safety'
import { checkCSRF } from '../../../lib/helpers'
import { PostgresError } from '../../../lib/types'
import db from '../../../lib/db'

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  let { email, name, password } = body
  name = sanitizeName(name)
  const passhash = await argon2.hash(password, ARGON_OPTIONS)
  try {
    const result = await db.query(
      `
        INSERT INTO public.users (email, name, passhash)
        VALUES ($1, $2, $3);
      `,
      [email, name, passhash]
    )
    if (result.rowCount !== 1) {
      return res.status(500).json({})
    }
  } catch (error) {
    console.error(error)
    return res.status(400).json(buildPostgresErrorJson(error as PostgresError))
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkCSRF(req, res, false)) return
  switch (req.method) {
    case 'POST':
      return create(req, res)
  }
  return res.status(405).json({})
}

export default handler
