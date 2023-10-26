import { Pool } from 'pg'
import * as jose from 'jose'

import { AuthPayload } from './types'
import { PG_CONN } from './env'

const connection = new Pool({
  connectionString: PG_CONN,
})

export const validateUserData = async (
  payload: AuthPayload | jose.JWTPayload
) => {
  const { sub: name, email } = payload
  if (!name || !email) {
    return false
  }
  const result = await connection.query(
    `
      SELECT true
      FROM public.users
      WHERE name = $1
        AND email = $2;
    `,
    [name, email]
  )
  return result.rowCount === 1
}

export const fetchBio = async (name: string) => {
  try {
    const result = await connection.query(
      `
        SELECT u.bio
        FROM public.users u
        WHERE u.name = $1;
      `,
      [name]
    )
    if (result.rowCount === 1) {
      return result.rows[0].bio
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

export default connection
