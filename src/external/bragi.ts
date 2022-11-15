import { get } from 'lodash/fp'
import superagent from 'superagent'

import { AUTOMATIONS_TOKEN, BRAGI_URL } from '../config/env'

const createJob = (body: any) => {
  return superagent
    .post(`${BRAGI_URL}/createScapingJob`)
    .set('Accept', 'application/json')
    .set('Authorization', `Basic ${AUTOMATIONS_TOKEN}`)
    .send(body)
    .then(get('status'))
}

const bragi = { createJob }

export { bragi }
