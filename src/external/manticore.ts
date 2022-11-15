import { get } from 'lodash/fp'
import * as request from 'superagent'

import { AUTOMATIONS_TOKEN, MANTICORE_PROCESS_ENGINE_URL } from '../config/env'

// Hardcoded for now, but need to extract this from manticore
type TStatus = 'pending' | 'queued' | 'running' | 'failed' | 'done' | 'disabled' | 'snoozed'

const findStepRunById = (stepRunId: string) =>
  request
    .get(`${MANTICORE_PROCESS_ENGINE_URL}/api/step-run/${stepRunId}`)
    .set('Accept', 'application/json')
    .set('Authorization', `Basic ${AUTOMATIONS_TOKEN}`)
    .then(get('body'))

const callback = ({
  stepRunId,
  data,
  status,
  errorMessage,
  errorCode,
}: {
  stepRunId: string
  data?: Record<string, unknown>
  status: TStatus
  errorMessage?: string
  errorCode?: string
}) =>
  request
    .post(`${MANTICORE_PROCESS_ENGINE_URL}/api/callback`)
    .set('Accept', 'application/json')
    .set('Authorization', `Basic ${AUTOMATIONS_TOKEN}`)
    .send({ stepRunId, data, status, errorMessage, errorCode })
    .then(get('body'))

const manticoreProcessEngine = { callback, findStepRunById }

export { manticoreProcessEngine }
