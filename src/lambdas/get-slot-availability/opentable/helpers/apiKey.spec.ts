import logger from '@invisible/logger'
import { expect } from 'chai'
import fs from 'fs'

import { getTokenFromHtmlBody, opentableApiKeyAndCookies } from './apiKey'
import { randomOpentableBusinesses } from './randomBusinesses'

describe.skip('opentableApiKeyAndCookies', () => {
  // Note, this will actually make a network call, so don't remove .skip unless you are testing locally
  it('should retrieve the new api key', async () => {
    const biz = (await randomOpentableBusinesses())[0]
    const { apiKey, cookie } = await opentableApiKeyAndCookies({
      business: biz,
      sessionId: 'abcdef',
    })
    logger.debug(apiKey, cookie)
  })
})

describe('getTokenFromHtmlBody', () => {
  it('should get the API key from the html file', async () => {
    const html = fs.readFileSync(`${__dirname}/../../test/fixtures/opentable/reservation.html`, {
      encoding: 'utf-8',
    })
    const actual = getTokenFromHtmlBody(html)
    const expected =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvdGNmcCI6IjQ0MTM2ZmEzNTViMzY3OGExMTQ2YWQxNmY3ZTg2NDllOTRmYjRmYzIxZmU3N2U4MzEwYzA2MGY2MWNhYWZmOGEiLCJpYXQiOjE2MjY0MjgyNTUsImV4cCI6MTYyNjQzOTA1NX0.Xh-IKmHHm6FVkif8ml6vVhliUd0poiKIA5j_SZduEkg'

    expect(actual).to.eq(expected)
  })
})
