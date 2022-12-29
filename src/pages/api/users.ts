import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import { genAuthCookie } from './login'
import { hasKey } from '../../lib/util'
import { processAuth } from '../../lib/safety'
import db from '../../lib/db'

const sanitizeName = (name: string) => name.toLowerCase()

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  let { email, name, password } = body
  name = sanitizeName(name)
  const passhash = await argon2.hash(password, {
    memoryCost: 16384, // 2^14
    timeCost: 64,
  })
  const result = await db.query(
    `
      INSERT INTO public.users (email, name, passhash)
      VALUES ($1, $2, $3);
    `,
    [email, name, passhash]
  )
  if (result.rowCount !== 1) {
    return res.status(500).json({})
  }
  return res.status(200).json({})
}

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = processAuth(req, res)
  if (!payload) return
  const currentSecs = Date.now() / 1000
  const remainingSecs = (payload.exp || currentSecs) - currentSecs
  const { body } = req
  if (hasKey(body, 'name')) {
    const { name: currentName, email } = payload
    let { name: newName } = body
    newName = sanitizeName(newName)
    try {
      await db.query(
        `
          UPDATE public.users
          SET name = $1
          WHERE name = $2;
        `,
        [newName, currentName]
      )
      const cookie = genAuthCookie(newName, email, remainingSecs)
      return res.status(200).setHeader('Set-Cookie', cookie).json({})
    } catch (error) {
      console.log(error)
      return res.status(500).json({})
    }
  }
  return res.status(200).json({})
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      return create(req, res)
    case 'PATCH':
      return update(req, res)
  }
  return res.status(405).json({})
}
