import { Static, Type } from '@sinclair/typebox'

import { chain, checkAuth, checkCSRF, validateRequestBody } from 'lib/api'
import { NetworkNameType, NetworkType, parsePostgresError } from 'lib/safety'
import { PostgresError } from 'lib/types'
import db from 'lib/db'

const reqBody = Type.Object({
  network: NetworkType,
  name: NetworkNameType,
  timestampMs: Type.String({ pattern: '\\d+' }),
  proof: Type.Object({
    url: Type.String(),
    messageID: Type.Optional(Type.String()),
  }),
})

type RequestBody = Static<typeof reqBody>

export const POST = chain(
  validateRequestBody(reqBody),
  checkAuth,
  checkCSRF,
  async (_, res, { auth, body }) => {
    const { sub: userName } = auth!
    const {
      network,
      name: networkName,
      timestampMs,
      proof,
    } = body as RequestBody
    try {
      await db.query(
        `
          WITH v as (
            INSERT INTO public.verifications (user_id, network, name, requested_at, proof)
            VALUES (
              (SELECT id FROM public.users WHERE name = $1),
              $2,
              $3,
              to_timestamp($4),
              $5
            )
            RETURNING user_id
          )
          UPDATE public.identities
          SET status = 'PENDING'
          WHERE user_id = (SELECT user_id FROM v)
            AND network = $2
            AND name = $3
            AND (
              status = 'UNVERIFIED'
              OR status = 'REJECTED'
            );
        `,
        [userName, network, networkName, timestampMs, JSON.stringify(proof)]
      )
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ error: parsePostgresError(error as PostgresError) })
    }
    return res.status(201).send()
  }
)
