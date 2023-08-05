import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import { ARGON_OPTIONS, sanitizeName } from '../../../lib/safety'
import { checkCSRF } from '../../../lib/helpers'
import db from '../../../lib/db'

interface PostgresError {
  length: number
  severity: 'ERROR' | 'FATAL' | 'PANIC'
  code: string
  detail: string
  hint?: string
  position?: number
  internalPosition?: number
  internalQuery?: string
  where?: string
  schema: string
  table: string
  column: string
  dataType?: string
  constraint?: string
  file: string
  line: string
  routine: string
}

const errorCode = (error: PostgresError) => {
  switch (error.constraint) {
    case 'users_email_key':
      return 'DUPLICATE_EMAIL'
    case 'users_name_key':
      return 'DUPLICATE_NAME'
    default:
      return 'UNKNOWN'
  }
}

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
    return res.status(400).json({
      error: errorCode(error as PostgresError),
    })
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
