import argon2 from 'argon2'

import {
  APIExtras,
  chain,
  checkAuth,
  checkCSRF,
  getUserData,
  ResponseState,
} from '../../../../lib/api'
import {
  ARGON_OPTIONS,
  buildPostgresErrorJson,
  sanitizeName,
} from '../../../../lib/safety'
import { genAuthCookie } from '../../../../lib/cookies'
import { hasKey } from '../../../../lib/util'
import { NextRequest } from 'next/server'
import { PostgresError } from '../../../../lib/types'
import db from '../../../../lib/db'

interface Data {
  name?: string
  email?: string
  bio?: string
  passhash?: string
}

const compareRouteWithAuth = async (
  _: NextRequest,
  res: ResponseState,
  { params, auth }: APIExtras
) => {
  const { name: routeName } = params!
  const { sub: authName } = auth!
  if (routeName !== authName) {
    res.options = { status: 401 }
    res.body = { message: 'Mismatch between path and token name' }
    return res.send()
  }
}

export const PATCH = chain(
  checkAuth,
  checkCSRF,
  compareRouteWithAuth,
  async (req, res, { auth }) => {
    const { sub: currentName, email: currentEmail } = auth!
    const data: Data = {}
    const body = await req.json()
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
      const user = await getUserData(
        currentEmail as string,
        body.currentPassword
      )
      if (user.valid) {
        data.passhash = await argon2.hash(body.futurePassword, ARGON_OPTIONS)
      } else {
        res.body = { error: 'WRONG_PASSWORD' }
        res.options = { status: 400 }
        return res.send()
      }
    }
    if (Object.keys(data).length === 0) {
      res.body = {
        message: 'No valid updates could be made with the provided data',
      }
      res.options = { status: 400 }
      return res.send()
    }
    const updates = Object.keys(data).map(
      (column, i) => `${column} = $${i + 1}`
    )
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
        res.body = { error: 'UNKNOWN_USER' }
        res.options = { status: 400 }
        return res.send()
      }
    } catch (error) {
      console.error(error)
      res.body = buildPostgresErrorJson(error as PostgresError)
      res.options = { status: 400 }
      return res.send()
    }
    if (data.name || data.email) {
      res.cookies.auth = await genAuthCookie(
        data.name || currentName,
        data.email || (currentEmail as string),
        auth!.exp!
      )
      res.cookies.csrf = {
        name: 'csrf',
        value: 'none',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV !== 'development',
      }
    }
    return res.send()
  }
)

export const DELETE = chain(
  checkAuth,
  checkCSRF,
  compareRouteWithAuth,
  async (_, res, { params }) => {
    const { name: routeName } = params!
    try {
      const result = await db.query(
        `
          DELETE FROM public.users
          WHERE name = $1;
        `,
        [routeName]
      )
      if (result.rowCount === 0) {
        res.body = { message: 'Invalid authenticated user' }
        res.options = { status: 400 }
      }
    } catch (error) {
      console.error(error)
      res.options = { status: 500 }
    }
    return res.send()
  }
)
