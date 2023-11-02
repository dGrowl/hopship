import { NextRequest } from 'next/server'
import argon2 from 'argon2'

import {
  ARGON_OPTIONS,
  buildPostgresErrorJson,
  sanitizeName,
} from '../../../lib/safety'
import { PostgresError } from '../../../lib/types'
import { chain, checkCSRF, ResponseState } from '../../../lib/api'
import db from '../../../lib/db'

export const POST = chain(
  checkCSRF,
  async (req: NextRequest, res: ResponseState) => {
    let { email, name, password } = await req.json()
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
        res.options = { status: 500 }
        return res.send()
      }
    } catch (error) {
      console.error(error)
      res.body = buildPostgresErrorJson(error as PostgresError)
      res.options = { status: 500 }
    }
    return res.send()
  }
)
