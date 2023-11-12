import { beforeAll, vi } from 'vitest'

import env from './testEnv'
import db from '../lib/db'

beforeAll(() => {
  vi.mock('../lib/env.ts', () => env)
})

const stop = () => {
  process.stderr.write('ERROR: Tests must be run on a test database')
  process.exit(-1)
}

beforeAll(async () => {
  const result = await db.query<{ db_name: string }>(
    'SELECT current_database() AS db_name;'
  )
  if (result.rowCount !== 1) {
    stop()
  }
  const { db_name: dbName } = result.rows[0]
  if (dbName !== 'hopship_test') {
    stop()
  }
})
