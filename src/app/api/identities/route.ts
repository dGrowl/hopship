import { Object as ObjectT, Static, String } from '@sinclair/typebox'

import { chain, checkAuth, checkCSRF, validateRequestBody } from 'lib/api'
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_REGEX,
  NetworkNameType,
  NetworkType,
  parsePostgresError,
} from '../../../lib/safety'
import { PostgresError } from 'lib/types'
import db from 'lib/db'

const reqBody = ObjectT({
  network: NetworkType,
  name: NetworkNameType,
  desc: String({
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
      return res
        .status(500)
        .send({ error: parsePostgresError(error as PostgresError) })
    }
    return res
      .status(201)
      .header('Location', `/identities/${network}/${networkName}`)
      .send()
  }
)
