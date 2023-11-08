import { Static, Type } from '@sinclair/typebox'

import {
  chain,
  checkAuth,
  checkCSRF,
  validateRequestBody,
} from '../../../../../lib/api'
import { DescriptionType } from '../../../../../lib/safety'
import db from '../../../../../lib/db'

const patchReqBody = Type.Object({
  desc: Type.Optional(DescriptionType),
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
        res.options = { status: 500 }
      }
    } else {
      res.options = { status: 400 }
      res.body = { message: 'Body missing update properties' }
    }
    return res.send()
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
      res.options = { status: 500 }
    }
    return res.send()
  }
)
