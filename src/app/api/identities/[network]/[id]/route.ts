import { Object as ObjectT, Optional, Static } from '@sinclair/typebox'

import { chain, checkAuth, checkCSRF, validateRequestBody } from 'lib/api'
import { DescriptionType, parsePostgresError } from 'lib/safety'
import { PostgresError } from 'lib/types'
import db from 'lib/db'

const patchReqBody = ObjectT({
  desc: Optional(DescriptionType),
})

type PatchRequestBody = Static<typeof patchReqBody>

export const PATCH = chain(
  validateRequestBody(patchReqBody),
  checkAuth,
  checkCSRF,
  async (_, res, { auth, body, params }) => {
    const { network, id: networkName } = params!
    const { sub: userName } = auth!
    const { desc } = body as PatchRequestBody
    if (desc !== undefined) {
      try {
        await db.query(
          `
            UPDATE public.identities
            SET description = $4
            WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
              AND network = $2
              AND name = $3;
          `,
          [userName, network, networkName, desc]
        )
      } catch (error) {
        console.error(error)
        return res
          .status(500)
          .send({ error: parsePostgresError(error as PostgresError) })
      }
    } else {
      return res.status(400).send({ error: 'NO_UPDATE_PROPERTIES' })
    }
  }
)

export const DELETE = chain(
  checkAuth,
  checkCSRF,
  async (_, res, { auth, params }) => {
    const { network, id: networkName } = params!
    const { sub: userName } = auth!
    try {
      await db.query(
        `
          DELETE FROM public.identities
          WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
            AND network = $2
            AND name = $3;
        `,
        [userName, network, networkName]
      )
    } catch (error) {
      console.error(error)
      return res
        .status(500)
        .send({ error: parsePostgresError(error as PostgresError) })
    }
  }
)
