import type { NextApiRequest, NextApiResponse } from 'next'

import { checkCSRF, processAuth } from '../../server/helpers'
import { hasKey } from '../../lib/util'
import db from '../../server/db'

const create = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { platform, name: platformName, desc } = req.body
  try {
    await db.query('CALL add_identity($1, $2, $3, $4);', [
      userName,
      platform,
      platformName,
      desc,
    ])
  } catch (error) {
    console.log(error)
    return res.status(500).json({})
  }
  return res.status(200).json({})
}

const update = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { body } = req
  const { platform, name: platformName, verified } = body
  if (hasKey(body, 'desc')) {
    const { desc } = body
    try {
      await db.query('CALL update_identity($1, $2, $3, $4, $5);', [
        userName,
        platform,
        platformName,
        desc,
        verified,
      ])
    } catch (error) {
      console.log(error)
      return res.status(500).json({})
    }
  }
  return res.status(200).json({})
}

const remove = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = processAuth(req, res)
  if (!payload) return
  const { name: userName } = payload
  const { body } = req
  const { platform, name: platformName, verified } = body
  try {
    await db.query('CALL delete_identity($1, $2, $3, $4);', [
      userName,
      platform,
      platformName,
      verified,
    ])
  } catch (error) {
    console.log(error)
    return res.status(500).json({})
  }
  return res.status(200).json({})
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!checkCSRF(req, res)) return
  switch (req.method) {
    case 'POST':
      return create(req, res)
    case 'PATCH':
      return update(req, res)
    case 'DELETE':
      return remove(req, res)
  }
  return res.status(405).json({})
}
