import { Static, Type } from '@sinclair/typebox'
import argon2 from 'argon2'

import {
  APIExtras,
  chain,
  checkAuth,
  checkCSRF,
  getUserData,
  ResponseState,
  validateRequestBody,
} from '../../../../lib/api'
import {
  ARGON_OPTIONS,
  buildPostgresErrorJson,
  PasswordType,
  sanitizeName,
} from '../../../../lib/safety'
import { genAuthCookie } from '../../../../lib/cookies'
import { NextRequest } from 'next/server'
import { PostgresError } from '../../../../lib/types'
import db from '../../../../lib/db'

const patchReqBody = Type.Object({
  name: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  bio: Type.Optional(Type.String()),
  password: Type.Optional(
    Type.Object({
      current: PasswordType,
      future: PasswordType,
    })
  ),
})

type PatchRequestBody = Static<typeof patchReqBody>

interface UpdateData {
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
  validateRequestBody(patchReqBody),
  checkAuth,
  checkCSRF,
  compareRouteWithAuth,
  async (_, res, { auth, body }) => {
    const { sub: currentName, email: currentEmail } = auth!
    const { name, email, bio, password } = body as PatchRequestBody
    const updateData: UpdateData = {}
    if (name !== undefined) {
      updateData.name = sanitizeName(name)
    }
    if (email !== undefined) {
      updateData.email = email
    }
    if (bio !== undefined) {
      updateData.bio = bio
    }
    if (password !== undefined) {
      const user = await getUserData(currentEmail, password.current)
      if (user.valid) {
        updateData.passhash = await argon2.hash(password.future, ARGON_OPTIONS)
      } else {
        res.body = { error: 'WRONG_PASSWORD' }
        res.options = { status: 400 }
        return res.send()
      }
    }
    if (Object.keys(updateData).length === 0) {
      res.body = {
        message: 'No valid updates could be made with the provided data',
      }
      res.options = { status: 400 }
      return res.send()
    }
    const updates = Object.keys(updateData).map(
      (column, i) => `${column} = $${i + 1}`
    )
    try {
      const result = await db.query(
        `
        UPDATE public.users
        SET ${updates.join(',')}
        WHERE name = $${updates.length + 1};
      `,
        [...Object.values(updateData), currentName]
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
    if (updateData.name || updateData.email) {
      res.cookies.auth = await genAuthCookie(
        updateData.name || currentName,
        updateData.email || (currentEmail as string),
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
