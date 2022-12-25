import type { NextApiRequest, NextApiResponse } from 'next'

const cookie = [
  `auth=0`,
  `Expires=${new Date(0)}`,
  'HttpOnly',
  'Path=/',
  'SameSite=Lax',
].join('; ')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).setHeader('Set-Cookie', cookie).json({})
}
