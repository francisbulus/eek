import { requesterFactory } from '../../helpers/requesterFactory'
import { randomUserAgentString } from '../../helpers/userAgent'

const yelpHeaders = async ({
  referer,
  userAgent,
}: {
  referer?: string
  userAgent?: string
}): Promise<[string, string][]> => [
  ['authority', 'www.yelp.com'],
  ['pragma', 'no-cache'],
  ['cache-control', 'no-cache'],
  ['sec-ch-ua', '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"'],
  ['accept', 'application/json, text/plain, */*'],
  ['x-requested-with', 'XMLHttpRequest'],
  ['sec-ch-ua-mobile', '?0'],
  ['user-agent', userAgent ?? randomUserAgentString()],
  ['sec-fetch-site', 'same-origin'],
  ['sec-fetch-mode', 'cors'],
  ['sec-fetch-dest', 'empty'],
  ['referer', referer ?? 'https://yelp.com'],
  ['accept-language', 'en-GB,en-US;q=0.9,en;q=0.8'],
]

const yelpRequest = requesterFactory({
  headersFn: yelpHeaders,
  methods: ['GET'],
})

export { yelpHeaders, yelpRequest }
