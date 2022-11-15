import { expect } from 'chai'
import fs from 'fs'
import { map } from 'lodash/fp'

import { getOpentableId, getOpentableUrlIdFromHtml } from './platformId'

describe('opentable platformId helpers', () => {
  describe('getOpentableUrlIdFromHtml', () => {
    it('should return the platform id if it is in the url', async () => {
      const urls = [
        'http://www.opentable.com/single.aspx?rid=49183',
        'https://www.opentable.com/single.aspx?rid=49182',
        'https://www.opentable.com/restref/client/?restref=000854',
        'https://www.opentable.com/aurora-soho-reservations-new-york?restref=14140',
        'https://www.opentable.com/restaurant/profile/1005211/reserve',
        'https://www.opentable.com/restaurant/profile/347200?ref=1068',
        'http://www.opentable.com/single.aspx?rid=12345,like',
        'https://www.opentable.com/restref/client/?restref=54321,like',
      ]

      const actual = await Promise.all(map(getOpentableId, urls))
      const expected = ['49183', '49182', '000854', '14140', '1005211', '347200', '12345', '54321']

      expect(actual).to.deep.eq(expected)
    })

    it.skip('should retrieve it from the web if not in the url', async () => {
      const urls = [
        'https://www.opentable.com/r/dillons-boston',
        'https://www.opentable.com/alibi-bar-and-lounge',
      ]

      const actual = await Promise.all(map(getOpentableId, urls))
      const expected = ['148033', '34189']

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('getOpentableUrlIdFromHtml', () => {
    it('should get the url id from the html file', async () => {
      const html = fs.readFileSync(
        `${__dirname}/../../test/fixtures/opentable/restaurant-page.html`,
        {
          encoding: 'utf-8',
        }
      )

      const actual = getOpentableUrlIdFromHtml(html)
      const expected = '148033'

      expect(actual).to.eq(expected)
    })
  })
})
