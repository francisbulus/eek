import { includes } from 'lodash/fp'
import type { Business } from 'prisma-seated'
import superagent from 'superagent'

import { ValidationError } from '../../../helpers/errors'
import type { TSuperagentWithProxy } from './proxy'
import { proxiedSuperagent, randomProxyUrl } from './proxy'
import { setHeaders } from './superagent'

type THeadersFn = (...args: any[]) => Promise<[string, string][]>

const RESPONSE_TIMEOUT = 13000
const DEADLINE_TIMEOUT = 60000
// const MY_IP_TIMEOUT = 5000

const requesterFactory = ({
  headersFn,
  methods = ['GET'],
}: {
  headersFn: THeadersFn
  methods?: string[]
}) => async ({
  method = 'GET',
  url,
  json = false,
  referer,
  userAgent,
  useProxy = true,
  sessionId,
  apiKey,
  body,
  business,
  responseTimeout = RESPONSE_TIMEOUT,
  deadlineTimeout = DEADLINE_TIMEOUT,
  cookie,
}: {
  method?: string
  url: string
  json?: boolean
  referer?: string
  userAgent?: string
  useProxy?: boolean
  sessionId?: string
  apiKey?: string | boolean
  body?: Record<string, any>
  business?: Business
  responseTimeout?: number
  deadlineTimeout?: number
  cookie?: string
}) => {
  if (!includes(method, methods)) {
    throw new ValidationError(`Methods other than ${methods.join(',')} are not currently supported`)
  }
  const timeoutObj = {
    response: responseTimeout,
    deadline: deadlineTimeout,
  }
  if (useProxy) {
    const { proxyUrl } = randomProxyUrl({ sessionId })

    const headers = await headersFn({ referer, userAgent, apiKey, sessionId, business, cookie })
    const sup = setHeaders(
      method === 'POST'
        ? superagent.post(url).send(body).accept('json').timeout(timeoutObj)
        : json
        ? superagent.get(url).type('json').accept('json').timeout(timeoutObj)
        : superagent.get(url).timeout(timeoutObj),
      headers
    ) as TSuperagentWithProxy
    return proxiedSuperagent({
      sup,
      proxyUrl,
    })
  } else {
    const headers = await headersFn({ referer, userAgent, apiKey, sessionId, cookie })
    const sup = setHeaders(
      method === 'POST'
        ? superagent.post(url).send(body).accept('json').timeout(timeoutObj)
        : json
        ? superagent.get(url).type('json').accept('json').timeout(timeoutObj)
        : superagent.get(url).timeout(timeoutObj),
      headers
    ) as TSuperagentWithProxy
    return sup
  }
}

export { requesterFactory }
export type { THeadersFn }
