import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

import { AuthPayload } from './types'

export const processAuth = (req: NextApiRequest, res: NextApiResponse) => {
  if (!process.env.JWT_AUTH_SECRET) {
    res.status(500).json({ message: 'Server environment missing auth secret' })
    return null
  }
  const { auth: token } = req.cookies
  if (!token) {
    res.status(401).json({
      message: 'Request did not contain required auth cookie',
    })
    return null
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_AUTH_SECRET)
    return payload as AuthPayload
  } catch (error) {
    console.log(error)
    res
      .status(401)
      .json({ message: 'Request contained an invalid auth cookie' })
  }
  return null
}
