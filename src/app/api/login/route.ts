import { chain, checkCSRF, getUserData } from '../../../lib/api'
import { genAuthCookie } from '../../../lib/cookies'

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7

export const POST = chain(checkCSRF, async (req, res) => {
  const { email, password } = await req.json()
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
})
