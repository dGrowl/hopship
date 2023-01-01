import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import { getUserData, genAuthCookie } from './login'
import { hasKey } from '../../lib/util'
import { processAuth } from '../../lib/safety'
import db from '../../lib/db'

interface Data {
  name?: string
  email?: string
  passhash?: string
}

const sanitizeName = (name: string) => name.toLowerCase()

const ARGON_OPTIONS = {
  memoryCost: 16384, // 2^14
  timeCost: 64,
} as const

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req
  let { email, name, password } = body
  name = sanitizeName(name)
  const passhash = await argon2.hash(password, ARGON_OPTIONS)
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
  const { body } = req
  const { name: currentName, email: currentEmail } = payload
  const data: Data = {}
  if (hasKey(body, 'name')) {
    data.name = sanitizeName(body.name)
  }
  if (hasKey(body, 'email')) {
    data.email = body.email
  }
  if (hasKey(body, 'oldPassword')) {
    const user = await getUserData(currentEmail, body.oldPassword)
    if (user) {
      data.passhash = await argon2.hash(body.newPassword, ARGON_OPTIONS)
    } else {
      return res
        .status(400)
        .json({ message: 'Provided existing password is incorrect' })
    }
  }
  if (!data.name && !data.email && !data.passhash) {
    return res.status(400).json({
      message: 'No valid updates could be made with the provided data',
    })
  }
  const updates = Object.keys(data).map((column, i) => `${column} = $${i + 1}`)
  try {
    await db.query(
      `
        UPDATE public.users
        SET ${updates.join(',')}
        WHERE name = $${updates.length + 1};
      `,
      [...Object.values(data), currentName]
    )
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Database update query failed' })
  }
  if (data.name || data.email) {
    const currentSecs = Date.now() / 1000
    const remainingSecs = (payload.exp || currentSecs) - currentSecs
    const cookie = genAuthCookie(
      data.name || currentName,
      data.email || currentEmail,
      remainingSecs
    )
    return res.status(200).setHeader('Set-Cookie', cookie).json({})
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      return create(req, res)
    case 'PATCH':
      return update(req, res)
  }
  return res.status(405).json({})
}

export default handler
