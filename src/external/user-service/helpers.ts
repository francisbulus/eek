import axios from 'axios'
import { get } from 'lodash/fp'

import { AUTOMATIONS_TOKEN, USER_SERVICE_URL } from '../../config/env'

const USER_SERVICE_VERSION = 'v1'

const userServiceEndpoint = (path: string) =>
  `${USER_SERVICE_URL}/api/${USER_SERVICE_VERSION}/${path}`

const userServicePost = async ({ path, body }: { path: string; body?: Record<string, unknown> }) =>
  axios
    .post(userServiceEndpoint(path), body ?? {}, {
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
    })
    .then(get('data'))

const userServiceGet = async ({ path }: { path: string }) =>
  axios
    .get(userServiceEndpoint(path), {
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
    })
    .then(get('data'))

const userServicePut = async ({ path, body }: { path: string; body?: Record<string, unknown> }) =>
  axios
    .put(userServiceEndpoint(path), body ?? {}, {
      headers: { Authorization: `Basic ${AUTOMATIONS_TOKEN}` },
    })
    .then(get('data'))

export {
  userServiceEndpoint, // For testing only
  userServiceGet,
  userServicePost,
  userServicePut,
}
