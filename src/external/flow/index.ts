import { Client } from 'pg'

import { FLOW_DB_URL } from './../../config/env'

export const getDBClient = () =>
  new Client({
    connectionString: FLOW_DB_URL,
    ssl: { rejectUnauthorized: false },
  })
