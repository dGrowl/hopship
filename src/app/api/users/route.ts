import { Static, Type } from '@sinclair/typebox'
import argon2 from 'argon2'

import {
  ARGON_OPTIONS,
  EmailType,
  parsePostgresError,
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
      await db.query(
        `
          INSERT INTO public.users (email, name, passhash)
          VALUES ($1, $2, $3);
        `,
        [email, name, passhash]
      )
    } catch (error) {
      console.error(error)
      const reason = parsePostgresError(error as PostgresError)
      return res
        .status(reason.includes('DUPLICATE') ? 409 : 500)
        .send({ error: reason })
    }
    return res.status(201).header('Location', `/users/${name}`).send()
  }
)
