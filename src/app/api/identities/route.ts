import { chain, checkAuth, checkCSRF } from '../../../lib/api'
import db from '../../../lib/db'

export const POST = chain(checkAuth, checkCSRF, async (req, res, { auth }) => {
  const { sub: userName } = auth!
  const { platform, network, name: networkName, desc } = await req.json()
  try {
    await db.query(
      `
        INSERT INTO public.identities (
          user_id,
          platform,
          network,
          name,
          description
        )
        VALUES (
          (SELECT id FROM public.users WHERE name = $1),
          $2,
          $3,
          $4,
          $5
        );
      `,
      [userName, platform, network, networkName, desc]
    )
  } catch (error) {
    console.error(error)
    res.options = { status: 500 }
  }
  return res.send()
})
