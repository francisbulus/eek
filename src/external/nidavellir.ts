import { get } from 'lodash/fp'
import superagent from 'superagent'

import { AUTOMATIONS_TOKEN, NIDAVELLIR_URL } from '../config/env'
import { IAutomationHandler } from '../helpers/types'

const createStepTemplate = (handler: IAutomationHandler<any, any> & { upsert?: boolean }) =>
  superagent
    .post(`${NIDAVELLIR_URL}/stepTemplate`)
    .set('Accept', 'application/json')
    .set('Authorization', `Basic ${AUTOMATIONS_TOKEN}`)
    .send(handler)
    .then(get('body'))

const nidavellir = { createStepTemplate }

export { nidavellir }
