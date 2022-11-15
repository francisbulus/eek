import { expect } from 'chai'
import fs from 'fs'

import { getSevenroomsId, getSevenroomsIdFromUrl, getSevenroomsUrlIdFromHtml } from './platformId'

describe('sevenrooms platformId helpers', () => {
  describe('getSevenroomsIdFromUrl', () => {
    it('should get the id from the url', async () => {
      const url = 'https://www.sevenrooms.com/reservations/armaniristorante/?asdf=123'

      const actual = getSevenroomsIdFromUrl(url)
      const expected = 'armaniristorante'

      expect(actual).to.eq(expected)
    })
  })

  describe('getSevenroomsUrlIdFromHtml', () => {
    it('should get the url id from the html file', async () => {
      const html = fs.readFileSync(
        `${__dirname}/../../test/fixtures/sevenrooms/restaurant-page.html`,
        {
          encoding: 'utf-8',
        }
      )

      const actual = getSevenroomsUrlIdFromHtml(html)
      const expected = 'armaniristorante'

      expect(actual).to.eq(expected)
    })
  })

  describe.skip('getSevenroomsId', () => {
    // Note, this will actually make a network call, so don't remove .skip unless you are testing locally'
    it('should fetch the restaurant id from the web', async () => {
      const actual = await getSevenroomsId(
        'https://www.sevenrooms.com/reservations/armaniristorante'
      )
      const expected = 'armaniristorante'

      expect(actual).to.eq(expected)
    })
  })
})
