import { Static, Type } from '@sinclair/typebox'

import { chain, checkCSRF, validateRequestBody } from '../../../lib/api'
import {
  EmailType,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from '../../../lib/safety'
import db from '../../../lib/db'

const reqBody = Type.Object({
  email: Type.Optional(EmailType),
  message: Type.String({
    maxLength: MESSAGE_MAX_LENGTH,
    minLength: MESSAGE_MIN_LENGTH,
  }),
})

type RequestBody = Static<typeof reqBody>

export const POST = chain(
  validateRequestBody(reqBody),
  checkCSRF,
  async (_, res, { body }) => {
    const { email, message } = body as RequestBody
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
      res.options = { status: 500 }
    }
    return res.send()
  }
)
