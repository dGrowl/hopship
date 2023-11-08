import { Static, Type } from '@sinclair/typebox'

import {
  chain,
  checkAuth,
  checkCSRF,
  validateRequestBody,
} from '../../../lib/api'
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_REGEX,
  NetworkNameType,
  NetworkType,
} from '../../../lib/safety'
import db from '../../../lib/db'

const reqBody = Type.Object({
  network: NetworkType,
  name: NetworkNameType,
  desc: Type.String({
    maxLength: DESCRIPTION_MAX_LENGTH,
    pattern: DESCRIPTION_REGEX,
  }),
})

type RequestBody = Static<typeof reqBody>

export const POST = chain(
  validateRequestBody(reqBody),
  checkAuth,
  checkCSRF,
  async (_, res, { auth, body }) => {
    const { sub: userName } = auth!
    const { network, name: networkName, desc } = body as RequestBody
    try {
      await db.query(
        `
        INSERT INTO public.identities (
          user_id,
          network,
          name,
          description
        )
        VALUES (
          (SELECT id FROM public.users WHERE name = $1),
          $2,
          $3,
          $4
        );
      `,
        [userName, network, networkName, desc]
      )
    } catch (error) {
      console.error(error)
      res.options = { status: 500 }
    }
    return res.send()
  }
)
