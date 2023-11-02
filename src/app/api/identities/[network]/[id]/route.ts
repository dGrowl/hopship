import { chain, checkAuth, checkCSRF } from '../../../../../lib/api'
import { hasKey } from '../../../../../lib/util'
import db from '../../../../../lib/db'

export const PATCH = chain(
  checkAuth,
  checkCSRF,
  async (req, res, { auth, params }) => {
    const { network, id: networkName } = params!
    const { sub: userName } = auth!
    const body = await req.json()
    if (hasKey(body, 'desc')) {
      try {
        await db.query(
          `
            UPDATE public.identities
            SET description = $4
            WHERE user_id = (SELECT id FROM public.users WHERE name = $1)
              AND network = $2
              AND name = $3;
          `,
          [userName, network, networkName, body.desc]
        )
      } catch (error) {
        console.error(error)
        res.options = { status: 500 }
      }
    } else {
      res.options = { status: 400 }
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
