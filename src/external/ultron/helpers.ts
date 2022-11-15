import axios from 'axios'
import { get } from 'lodash/fp'

import { AUTOMATIONS_TOKEN, ULTRON_URL } from '../../config/env'

const ULTRON_VERSION = 'v1'

const ultronEndpoint = (path: string) => `${ULTRON_URL}/api/${ULTRON_VERSION}/${path}`

const ultronPost = async ({ path, body }: { path: string; body?: Record<string, unknown> }) =>
  axios
    .post(ultronEndpoint(path), body ?? {}, {
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
    })
    .then(get('data'))

const ultronGet = async ({ path, query }: { path: string; query?: Record<string, unknown> }) =>
  axios
    .get(ultronEndpoint(path), {
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
      params: query,
    })
    .then(get('data'))

const ultronPut = async ({ path, body }: { path: string; body?: Record<string, unknown> }) =>
  axios
    .put(ultronEndpoint(path), body ?? {}, {
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
    })
    .then(get('data'))

export {
  ultronEndpoint, // For testing only
  ultronGet,
  ultronPost,
  ultronPut,
}
