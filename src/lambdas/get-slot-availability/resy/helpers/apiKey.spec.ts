import logger from '@invisible/logger'
import { expect } from 'chai'
import fs from 'fs'

import { getApiKeyFromMainJs, getResyMainJsUrl, refreshApiKey } from './apiKey'
import { randomResyBusinesses } from './randomBusinesses'

describe.skip('refreshApiKey', () => {
  // Note, this will actually make a network call, so don't remove .skip unless you are testing locally
  it('should retrieve the new api key', async () => {
    const business = (await randomResyBusinesses())[0]

    const apiKey = await refreshApiKey(business)
    logger.info(apiKey)
  })
})

describe('getResyMainJsUrl', () => {
  it('should get the url of the main js from the restaurant html', async () => {
    const html = fs.readFileSync(`${__dirname}/../../test/fixtures/resy/restaurant.html`, {
      encoding: 'utf-8',
    })
    const actual = getResyMainJsUrl(html)
    expect(actual).to.eq('https://resy.com/modules/app.6dcd15a10e203eb492d6.js')
  })
})

describe('getApiKeyFromMainJs', () => {
  it('should get the API key from the js file', async () => {
    const js = fs.readFileSync(`${__dirname}/../../test/fixtures/resy/app.js`, {
      encoding: 'utf-8',
    })
    const actual = getApiKeyFromMainJs(js)
    expect(actual).to.eq('VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5')
  })
})
