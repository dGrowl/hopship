import { chain, checkCSRF } from '../../../lib/api'
import db from '../../../lib/db'

export const POST = chain(checkCSRF, async (req, res) => {
  const { email, message } = await req.json()
  try {
    await db.query(
      `
        INSERT INTO public.admin_messages (email, message)
        VALUES ($1, $2)
      `,
      [email || null, message]
    )
  } catch (error) {
    console.error(error)
    res.options = { status: 500 }
  }
  return res.send()
})
