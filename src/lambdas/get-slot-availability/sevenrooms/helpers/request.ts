import { requesterFactory } from '../../helpers/requesterFactory'
import { randomUserAgentString } from '../../helpers/userAgent'

const sevenroomsHeaders = async ({
  referer,
  userAgent,
}: {
  referer?: string
  userAgent?: string
}): Promise<[string, string][]> => [
  ['authority', 'www.sevenrooms.com'],
  ['pragma', 'no-cache'],
  ['cache-control', 'no-cache'],
  ['sec-ch-ua', '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"'],
  ['sec-ch-ua-mobile', '?0'],
  ['user-agent', userAgent ?? randomUserAgentString()],
  ['accept', '*/*'],
  ['sec-fetch-site', 'same-origin'],
  ['sec-fetch-mode', 'cors'],
  ['sec-fetch-dest', 'empty'],
  ['referer', referer ?? 'https://www.sevenrooms.com'],
  ['accept-language', 'en-US,en;q=0.9'],
  ['dnt', '1'],
  ['sec-gpc', '1'],
]

const sevenroomsRequest = requesterFactory({
  headersFn: sevenroomsHeaders,
  methods: ['GET'],
})

export { sevenroomsHeaders, sevenroomsRequest }
