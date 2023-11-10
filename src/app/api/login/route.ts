import { Static, Type } from '@sinclair/typebox'

import {
  chain,
  checkCSRF,
  getUserData,
  validateRequestBody,
} from '../../../lib/api'
import { EmailType, PasswordType } from '../../../lib/safety'
import { genAuthCookie } from '../../../lib/cookies'

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7

const reqBody = Type.Object({
  email: EmailType,
  password: PasswordType,
})

type RequestBody = Static<typeof reqBody>

export const POST = chain(
  validateRequestBody(reqBody),
  checkCSRF,
  async (_, res, { body }) => {
    const { email, password } = body as RequestBody
    const user = await getUserData(email, password)
    if (user.valid) {
      res.cookie(
        'auth',
        await genAuthCookie(
          user.name,
          email,
          Date.now() / 1000 + WEEK_IN_SECONDS
        )
      )
      res.cookie('csrf', { name: 'csrf', value: 'none', expires: 0 })
    } else {
      res.status(401).send({
        error: user.error,
      })
    }
  }
)
