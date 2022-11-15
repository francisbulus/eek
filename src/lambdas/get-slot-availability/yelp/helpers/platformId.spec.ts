import { expect } from 'chai'
import fs from 'fs'
import { map } from 'lodash/fp'
import pSleep from 'p-sleep'

import {
  getYelpLatitudeLongitudeFromHtml,
  getYelpUrlIdFromHtml,
  getYelpUrlIdLatLong,
  yelpSlugFromUrl,
} from './platformId'

describe('yelp platformId helpers', () => {
  describe('yelpSlugFromUrl', () => {
    it('should get the slug from the url', async () => {
      const urls = [
        'https://www.yelp.com/reservations/the-harp-and-fiddle-park-ridge?asdf=123&afdfdf',
        'http://www.yelp.com/biz/burkys-grill-myrtle-beach/?asdf=123&afdfdf',
      ]

      const actual = map(yelpSlugFromUrl, urls)
      const expected = ['the-harp-and-fiddle-park-ridge', 'burkys-grill-myrtle-beach']
      expect(actual).to.deep.eq(expected)
    })
  })

  describe('getYelpUrlIdFromHtml', () => {
    it('should get the yelp url id from the reservation page html', async () => {
      const html = fs.readFileSync(`${__dirname}/../../test/fixtures/yelp/reservation.html`, {
        encoding: 'utf-8',
      })

      const actual = getYelpUrlIdFromHtml(html)
      const expected = 'BlzlywklvYdek5uk_NCX9g'
      expect(actual).to.eq(expected)
    })
  })

  describe('getYelpLatitudeLongitudeFromHtml', () => {
    it('should get the latitude and longitude from the html', async () => {
      const html = fs.readFileSync(`${__dirname}/../../test/fixtures/yelp/reservation.html`, {
        encoding: 'utf-8',
      })
      const actual = getYelpLatitudeLongitudeFromHtml(html)
      const expected = { latitude: 40.7131652, longitude: -73.9494479 }
      expect(actual).to.deep.eq(expected)
    })
  })

  describe.skip('getYelpUrlIdLatLong', () => {
    it('should get the url id, latitude, and longitude from the web', async () => {
      const urls = [
        'https://www.yelp.com/reservations/the-harp-and-fiddle-park-ridge?asdf=123&afdfdf',
        'https://www.yelp.com/biz/the-cheesecake-factory-san-francisco-2?frvs=True&osq=reservations',
      ]

      const actual0 = await getYelpUrlIdLatLong(urls[0])

      const expected0 = {
        url_id: 'ZBoA_08nvPmHL3IseILAcg',
        latitude: 42.0097745246684,
        longitude: -87.8316065102906,
      }
      expect(actual0).to.deep.eq(expected0)

      await pSleep(4000)
      const actual1 = await getYelpUrlIdLatLong(urls[1])
      const expected1 = {
        url_id: 'aSeldMKv9G6_8-gV0bjwvw',
        latitude: 37.787253,
        longitude: -122.40744302193836,
      }

      expect(actual1).to.deep.eq(expected1)
    })
  })

  describe('no latitude longitude', () => {
    it('should throw an error if there is no latitude or longitude', async () => {
      const html = fs.readFileSync(`${__dirname}/../../test/fixtures/yelp/no-lat-long.html`, {
        encoding: 'utf-8',
      })

      try {
        getYelpLatitudeLongitudeFromHtml(html)
        throw new Error(`Didn't throw`)
      } catch (err: any) {
        expect(err.message).to.eq('Warn: yelp: Could not retrieve latitude from html')
      }
    })
  })
})
