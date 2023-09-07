import argon2 from 'argon2'
import type { NextApiRequest, NextApiResponse } from 'next'

import {
  ARGON_OPTIONS,
  buildPostgresErrorJson,
  sanitizeName,
} from '../../../lib/safety'
import { buildCookie, hasKey } from '../../../lib/util'
import { checkCSRF, processAuth } from '../../../lib/helpers'
import { getUserData, genAuthCookie } from '../login'
import db from '../../../lib/db'
import { PostgresError } from '../../../lib/types'

interface Data {
  name?: string
  email?: string
  bio?: string
  passhash?: string
}

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { body, query } = req
  const { name: currentName } = query
  if (currentName !== payload.name) {
    return res
      .status(401)
      .json({ message: 'Mismatch between path and token name' })
  }
  const { email: currentEmail } = payload
  const data: Data = {}
  if (hasKey(body, 'name')) {
    data.name = sanitizeName(body.name)
  }
  if (hasKey(body, 'email')) {
    data.email = body.email
  }
  if (hasKey(body, 'bio')) {
    data.bio = body.bio
  }
  if (hasKey(body, 'currentPassword')) {
    const user = await getUserData(currentEmail, body.currentPassword)
    if (user.valid) {
      data.passhash = await argon2.hash(body.futurePassword, ARGON_OPTIONS)
    } else {
      return res.status(400).json({ error: 'WRONG_PASSWORD' })
    }
  }
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      message: 'No valid updates could be made with the provided data',
    })
  }
  const updates = Object.keys(data).map((column, i) => `${column} = $${i + 1}`)
  try {
    const result = await db.query(
      `
        UPDATE public.users
        SET ${updates.join(',')}
        WHERE name = $${updates.length + 1};
      `,
      [...Object.values(data), currentName]
    )
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'UNKNOWN_USER' })
    }
  } catch (error) {
    console.error(error)
    return res.status(400).json(buildPostgresErrorJson(error as PostgresError))
  }
  if (data.name || data.email) {
    const currentSecs = Date.now() / 1000
    const remainingSecs = (payload.exp || currentSecs) - currentSecs
    const newAuthCookie = genAuthCookie(
      data.name || currentName,
      data.email || currentEmail,
      remainingSecs
    )
    const clearCSRFCookie = buildCookie('csrf', 'none', 0)
    return res
      .status(200)
      .setHeader('Set-Cookie', [newAuthCookie, clearCSRFCookie])
      .json({})
  }
  return res.status(200).json({})
}

const remove = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = await processAuth(req, res)
  if (!payload) return
  const { name } = req.query
  if (name !== payload.name) {
    return res
      .status(401)
      .json({ message: 'Mismatch between path and token name' })
  }
  const result = await db.query(
    `
      DELETE FROM public.users
      WHERE name = $1;
    `,
    [name]
  )
  if (result.rowCount === 0) {
    return res.status(400).json({ message: 'Invalid authenticated user' })
  }
  return res.status(200).json({})
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkCSRF(req, res)) return
  switch (req.method) {
    case 'PATCH':
      return update(req, res)
    case 'DELETE':
      return remove(req, res)
  }
  return res.status(405).json({})
}

export default handler
