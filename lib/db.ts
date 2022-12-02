import { Pool } from 'pg'

const connection = new Pool({
  connectionString:
    process.env.NODE_ENV === 'development'
      ? process.env.PG_CONN_DEV
      : process.env.PG_CONN,
})

export default connection
