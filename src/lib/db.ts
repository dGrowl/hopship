import { Pool } from 'pg'

const connection = new Pool({
  connectionString: process.env.PG_CONN,
})

export default connection
