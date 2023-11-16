import { beforeAll } from 'vitest'

import db from 'lib/db'

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
