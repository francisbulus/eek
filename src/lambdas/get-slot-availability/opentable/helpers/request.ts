import { compact } from 'lodash/fp'

import { requesterFactory } from '../../helpers/requesterFactory'
import type { IValidOpentableBusiness } from '../../helpers/types'
import { randomUserAgentString } from '../../helpers/userAgent'
import { opentableApiKeyAndCookies } from './apiKey'

const opentableHeaders = async ({
  referer,
  apiKey,
  userAgent,
  sessionId,
  business,
  cookie,
}: {
  referer?: string
  apiKey?: boolean | string
  userAgent?: string
  sessionId?: string
  business: IValidOpentableBusiness
  cookie?: string
}): Promise<[string, string][]> => {
  if (apiKey === true) {
    const apiKeyAndCookies = await opentableApiKeyAndCookies({ business, sessionId })
    apiKey = apiKeyAndCookies.apiKey
    cookie = apiKeyAndCookies.cookie
  }
  return compact([
    ['accept', '*/*'],
    ['accept-encoding', 'gzip, deflate, br'],
    ['accept-language', 'en-GB,en-US;q=0.9,en;q=0.8'],
    ['content-type', 'application/json'],
    ['origin', 'https://www.opentable.com'],
    apiKey ? ['authorization', `Bearer ${apiKey}`] : undefined,
    ['sec-ch-ua-mobile', '?0'],
    ['sec-fetch-dest', 'empty'],
    ['sec-fetch-mode', 'cors'],
    ['sec-fetch-site', 'same-origin'],
    ['user-agent', userAgent ?? randomUserAgentString()],
    ['referer', referer ?? 'https://opentable.com'],
    ['cookie', cookie || ''],
  ])
}

const opentableRequest = requesterFactory({
  headersFn: opentableHeaders,
  methods: ['GET', 'POST'],
})

export { opentableHeaders, opentableRequest }
