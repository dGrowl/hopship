import { chain, checkAuth, checkCSRF } from '../../../lib/api'
import db from '../../../lib/db'

export const POST = chain(checkAuth, checkCSRF, async (req, res, { auth }) => {
  const { sub: userName } = auth!
  const { network, name: networkName, timestampMs, proof } = await req.json()
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
    res.options = { status: 500 }
  }
  return res.send()
})
