import logger from '@invisible/logger'
import { expect } from 'chai'

import { getResyUrlId, resyVenueUrl } from './platformId'

describe('resy platform id', () => {
  describe('resyVenueUrl', () => {
    it('should get the platform id from the url', async () => {
      const url = 'https://resy.com/cities/sea/fog-room?'
      const actual = resyVenueUrl(url)
      expect(actual).to.equal('https://api.resy.com/3/venue?location=sea&url_slug=fog-room')
    })

    it('should work with query params ', async () => {
      const url = 'https://resy.com/cities/sea/fog-room?date=2021-07-28&seats=2'
      const actual = resyVenueUrl(url)
      expect(actual).to.equal('https://api.resy.com/3/venue?location=sea&url_slug=fog-room')
    })

    it('should work with trailing slashes', async () => {
      const url = 'https://resy.com/cities/sea/fog-room/'
      const actual = resyVenueUrl(url)
      expect(actual).to.equal('https://api.resy.com/3/venue?location=sea&url_slug=fog-room')
    })

    it('should work with trailing slashes and query params', async () => {
      const url = 'https://resy.com/cities/sea/fog-room/?date=2021-07-28&seats=2'
      const actual = resyVenueUrl(url)
      expect(actual).to.equal('https://api.resy.com/3/venue?location=sea&url_slug=fog-room')
    })
  })

  describe.skip('getResyUrlId', () => {
    it('should retrieve the venue data', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally'
      const url = 'https://resy.com/cities/sea/fog-room?date=2021-07-28&seats=2'
      const actual = await getResyUrlId(url)

      logger.info(JSON.stringify(actual))
      expect(actual).to.eq(43644)
    })
  })
})
