import axios from 'axios'
import { get } from 'lodash/fp'

import { AUTOMATIONS_TOKEN, LAMBDA_URL } from '../config/env'

const getCredential = async (key: string): Promise<string> =>
  axios
    .get(`${LAMBDA_URL}/api/credentials`, {
      data: { key },
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
    })
    .then(get('data'))

const setCredential = async (key: string, value: string): Promise<string> =>
  axios
    .post(
      `${LAMBDA_URL}/api/credentials`,
      { key, value },
      { headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` } }
    )
    .then(get('data'))

const lambda = {
  getCredential,
  setCredential,
}

export { lambda }
