import axios from 'axios'
import { first, get } from 'lodash/fp'

import { OPSGENIE_API_KEY } from './config/env'

const BASE_URL = 'https://api.opsgenie.com'

const OPSGENIE_VERSION = 2

const opsGenie = axios.create({
  baseURL: `${BASE_URL}/v${OPSGENIE_VERSION}`,
  headers: {
    Authorization: `GenieKey ${OPSGENIE_API_KEY}`,
  },
})

const getOnCall = async ({ scheduleId }: { scheduleId: string }): Promise<string> =>
  opsGenie
    .get(`/schedules/${scheduleId}/on-calls?flat=true`)
    .then(get('data.data.onCallRecipients'))
    .then(first) as any

export default {
  getOnCall,
}
