import { each } from 'lodash/fp'
import superagent from 'superagent'

const setHeaders = (sup: superagent.SuperAgentRequest, headers?: [string, string][]) => {
  if (!headers) return sup
  each(([k, v]) => {
    sup.set(k, v)
  }, headers)
  return sup
}

export { setHeaders }
