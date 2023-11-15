import { NextRequest } from 'next/server'
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
} from 'lib/api'
import {
  ARGON_OPTIONS,
  parsePostgresError,
  PasswordType,
  sanitizeName,
} from 'lib/safety'
import { genAuthCookie } from 'lib/cookies'
import { PostgresError } from 'lib/types'
import db from 'lib/db'

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
    return res.status(401).send({ error: 'AUTH_PARAM_MISMATCH' })
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
        return res.status(400).send({ error: 'WRONG_PASSWORD' })
      }
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        error: 'NO_UPDATE_PROPERTIES',
      })
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
        return res.status(400).send({ error: 'UNKNOWN_USER' })
      }
    } catch (error) {
      console.error(error)
      return res
        .status(500)
        .send({ error: parsePostgresError(error as PostgresError) })
    }
    if (updateData.name || updateData.email) {
      res.cookie(
        'auth',
        await genAuthCookie(
          updateData.name || currentName,
          updateData.email || currentEmail,
          auth!.exp!
        )
      )
      res.cookie('csrf', {
        name: 'csrf',
        value: 'none',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV !== 'development',
      })
    }
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
        res.status(400).send({ error: 'USER_NAME_NOT_FOUND' })
      }
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .send({ error: parsePostgresError(error as PostgresError) })
    }
  }
)
