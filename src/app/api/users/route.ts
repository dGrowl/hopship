import { Static, Type } from '@sinclair/typebox'
import argon2 from 'argon2'

import {
  ARGON_OPTIONS,
  buildPostgresErrorJson,
  EmailType,
  PasswordType,
  sanitizeName,
  UserNameType,
} from '../../../lib/safety'
import { chain, checkCSRF, validateRequestBody } from '../../../lib/api'
import { PostgresError } from '../../../lib/types'
import db from '../../../lib/db'

const reqBody = Type.Object({
  email: EmailType,
  name: UserNameType,
  password: PasswordType,
})

type RequestBody = Static<typeof reqBody>

export const POST = chain(
  validateRequestBody(reqBody),
  checkCSRF,
  async (_, res, { body }) => {
    const { email, name: untrustedName, password } = body as RequestBody
    const name = sanitizeName(untrustedName)
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
