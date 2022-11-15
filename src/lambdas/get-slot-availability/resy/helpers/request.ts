import { compact } from 'lodash/fp'

import { requesterFactory } from '../../helpers/requesterFactory'
import { IValidResyBusiness } from '../../helpers/types'
import { randomUserAgentString } from '../../helpers/userAgent'
import { resyApiKey } from './apiKey'

const resyHeaders = async ({
  referer,
  apiKey,
  userAgent,
  business,
}: {
  referer?: string
  apiKey?: boolean
  userAgent?: string
  business: IValidResyBusiness
}): Promise<[string, string][]> =>
  compact([
    ['authority', 'api.resy.com'],
    ['pragma', 'no-cache'],
    ['cache-control', 'no-cache'],
    ['sec-ch-ua', '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"'],
    ['dnt', '1'],
    ['x-origin', 'https://resy.com'],
    ['sec-ch-ua-mobile', '?0'],
    apiKey ? ['authorization', `ResyAPI api_key="${await resyApiKey(business)}"`] : undefined,
    ['accept', 'application/json, text/plain, */*'],
    ['user-agent', userAgent ?? randomUserAgentString()],
    ['origin', 'https://resy.com'],
    ['sec-fetch-site', 'same-site'],
    ['sec-fetch-mode', 'cors'],
    ['sec-fetch-dest', 'empty'],
    ['referer', referer ?? 'https://resy.com'],
    ['accept-language', 'en-US,en;q=0.9'],
    ['sec-gpc', '1'],
  ])

const resyRequest = requesterFactory({
  headersFn: resyHeaders,
  methods: ['GET'],
})

export { resyHeaders, resyRequest }
