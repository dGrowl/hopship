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
      res.cookies.auth = await genAuthCookie(
        user.name,
        email,
        Date.now() / 1000 + WEEK_IN_SECONDS
      )
      res.cookies.csrf = { name: 'csrf', value: 'none', expires: 0 }
    } else {
      res.body = {
        message: "Provided account credentials don't match any known users",
        error: user.error,
      }
      res.options = { status: 401 }
    }
    return res.send()
  }
)
