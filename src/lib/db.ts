import { Pool } from 'pg'

import { PG_CONN } from './env'

const connection = new Pool({
  connectionString: PG_CONN,
})

export default connection
