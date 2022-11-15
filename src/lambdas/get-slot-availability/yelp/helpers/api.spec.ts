import logger from '@invisible/logger'
import { expect } from 'chai'
import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'

import { prisma } from '../../config/prisma'
import { epochSeconds } from '../../helpers/date'
import type { IValidYelpBusiness } from '../../helpers/types'
import { seedAll as seed } from '../../prisma/seedHelpers'
import * as DATA from '../../test/fixtures/yelp/api-result.json'
import * as DATA_MULTIPLE_DAYS from '../../test/fixtures/yelp/api-result-multiple-days.json'
import type { IYelpApiResult } from './api'
import {
  getAvailabilityAndParse,
  getYelpData,
  isValidResponse,
  markUnavailable,
  slotAvailability,
  slotTimeRangeToKey,
  yelpSlug,
  yelpUrl,
} from './api'

const setup = async () => {
  const external_id = 7666
  const business = await prisma.business.findFirst({ where: { external_id } })
  if (!business) {
    throw new Error(`Seed data failed, no restaurant found with external_id: ${external_id}`)
  }

  const slots_date = '2021-07-15'
  const slots_start_time = '17:00'
  const slots_end_time = '21:00'
  const party_size = 2

  const batch = await prisma.batch.create({
    data: {
      check_date: new Date(),
      check_time: '09:00',
      check_dow: 'monday',
      cohort_id: business.cohort_id,
      cohort_external_id: business.cohort_external_id,
      num_businesses: 1,
      slots_per_run: 20,
      num_party_sizes: 2,
      expected_num_slots: 40,
    },
  })

  return {
    business: business as IValidYelpBusiness,
    data: { ...(DATA as IYelpApiResult) },
    slots_date,
    slots_start_time,
    slots_end_time,
    party_size,
    batch,
  }
}
describe('yelp helpers', () => {
  before(async () => {
    await seed()
  })

  describe('yelpSlug', () => {
    it('should return the slug', async () => {
      const url = 'https://www.yelp.com/reservations/fabbrica-restaurant-and-bar-brooklyn'
      const actual = yelpSlug(url)
      expect(actual).to.eq('fabbrica-restaurant-and-bar-brooklyn')
    })

    it('should strip off query params if present', () => {
      const url =
        'https://www.yelp.com/reservations/loca-luna-atlanta?covers=2&date=2021-04-29&source=widget&time=1900&utm_source=widget'
      const actual = yelpSlug(url)
      expect(actual).to.eq('loca-luna-atlanta')
    })
  })

  describe('yelpUrl', () => {
    it('should generate the correct url', async () => {
      const biz = {
        latitude: 40.7632494,
        longitude: -73.9869771,
        url: 'https://www.yelp.com/biz/uogashi-new-york-3',
        url_id: 'tyyqm0ftkoKQxednWNh0Tg',
      } as IValidYelpBusiness
      const actual = yelpUrl({
        business: biz,
        time: '19:30',
        party_size: 2,
        date: '2021-08-01',
      })

      const expected =
        'https://www.yelp.com/reservations/uogashi-new-york-3/search_availability?append_request=false&biz_id=tyyqm0ftkoKQxednWNh0Tg&biz_lat=40.7632494&biz_long=-73.9869771&covers=2&date=2021-08-01&days_after=0&days_before=0&num_results_after=24&num_results_before=0&search_type=URL_INITIATE_SEARCH&time=19:30&weekly_search_enabled=true'

      expect(actual).to.eq(expected)
    })
  })

  describe.skip('getYelpData', () => {
    // Warning, this test makes an actual network call, so it should be skipped for CI and only run locally
    it('should retrieve the availability', async () => {
      const { business } = await setup()
      const actual = await getYelpData({
        business,
        party_size: 4,
        slotTimeRanges: [
          {
            slots_date: dateFns.format(new Date(), 'yyyy-MM-dd'),
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
        ],
        useProxy: true,
      })

      logger.debug(JSON.stringify(actual, null, 2))
    })
  })

  describe('isValidResponse', () => {
    it('should return true if valid yelp api response', async () => {
      const actual = isValidResponse(DATA)
      expect(actual).to.eq(true)

      const actual2 = isValidResponse(DATA_MULTIPLE_DAYS)
      expect(actual2).to.eq(true)
    })

    it('should return false if invalid yelp api response', async () => {
      const data = { ...DATA }
      data.success = false
      const actual = isValidResponse(data)
      expect(actual).to.eq(false)

      const data2: any = { ...DATA }
      data2.availability_data = undefined
      const actual2 = isValidResponse(data)
      expect(actual2).to.eq(false)
    })
  })

  describe('markUnavailable', () => {
    it('should mark all slots unavailable', async () => {
      const { business } = await setup()
      const slots_date = '2021-04-20'
      const slot_time_range = {
        slots_date,
        slots_start_time: '11:00',
        slots_end_time: '22:00',
      }

      const slotsObj = {
        // These are within range, so they'll be overridden
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 11:00`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 11:30`, business.timezone))]: true,

        // These are outside the range, so they'll stick around
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 08:30`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 10:30`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 23:00`, business.timezone))]: null,
      }

      markUnavailable({ slot_time_range, business, slotsObj })

      const expected = {
        '1618921800': true,
        '1618929000': true,
        '1618930800': false,
        '1618931700': false,
        '1618932600': false,
        '1618933500': false,
        '1618934400': false,
        '1618935300': false,
        '1618936200': false,
        '1618937100': false,
        '1618938000': false,
        '1618938900': false,
        '1618939800': false,
        '1618940700': false,
        '1618941600': false,
        '1618942500': false,
        '1618943400': false,
        '1618944300': false,
        '1618945200': false,
        '1618946100': false,
        '1618947000': false,
        '1618947900': false,
        '1618948800': false,
        '1618949700': false,
        '1618950600': false,
        '1618951500': false,
        '1618952400': false,
        '1618953300': false,
        '1618954200': false,
        '1618955100': false,
        '1618956000': false,
        '1618956900': false,
        '1618957800': false,
        '1618958700': false,
        '1618959600': false,
        '1618960500': false,
        '1618961400': false,
        '1618962300': false,
        '1618963200': false,
        '1618964100': false,
        '1618965000': false,
        '1618965900': false,
        '1618966800': false,
        '1618967700': false,
        '1618968600': false,
        '1618969500': false,
        '1618970400': false,
        '1618974000': null,
      }

      expect(slotsObj).to.deep.eq(expected)
    })
  })

  describe('slotAvailability', () => {
    it('should parse the slotsObj into the seated slots format', async () => {
      const { business } = await setup()
      const slots_date = '2021-04-20'
      const slotTimeRanges = [
        {
          slots_date,
          slots_start_time: '11:00',
          slots_end_time: '14:00',
        },
      ]

      const slotsObj = {
        // These are within range,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 11:00`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 11:30`, business.timezone))]: false,

        // nulls are filtered out
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 12:30`, business.timezone))]: null,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 13:30`, business.timezone))]: null,

        // These are outside the range, so they'll be filtered out
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 08:30`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 10:30`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 23:00`, business.timezone))]: false,
      }

      const actual = slotAvailability({
        business,
        slotTimeRanges,
        slotsObj,
        humanReadableDate: true,
      })

      const expected = [
        {
          slot_date: 1618930800000,
          available: true,
          humanReadableDate: '2021-04-20T11:00',
        },
        {
          slot_date: 1618932600000,
          available: false,
          humanReadableDate: '2021-04-20T11:30',
        },
      ]

      expect(actual).to.deep.eq(expected)
    })

    it('should work with slotTimeOverrides too', async () => {
      const { business } = await setup()
      const slots_date = '2021-04-20'
      const slotTimeRanges = [
        {
          slots_date,
          slots_start_time: '11:00',
          slots_end_time: '14:00',
        },
      ]

      const slotTimeOverrides = [
        dateFnsTz.zonedTimeToUtc(`${slots_date} 11:00`, business.timezone),
        dateFnsTz.zonedTimeToUtc(`${slots_date} 13:30`, business.timezone),

        // this is outside the range, but since it's an override, it won't be filtered out
        dateFnsTz.zonedTimeToUtc(`${slots_date} 23:00`, business.timezone),
      ]

      const slotsObj = {
        // This is in range and in slotTimeOverrides
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 11:00`, business.timezone))]: true,

        // This is in range and not in slotTimeOverrides, so it'll be filtered out
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 11:30`, business.timezone))]: false,

        // nulls are filtered out
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 12:30`, business.timezone))]: null,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 13:30`, business.timezone))]: null,

        // These are outside the range, so they'll be filtered out
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 08:30`, business.timezone))]: true,
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 10:30`, business.timezone))]: true,

        // This one is legit now
        [epochSeconds(dateFnsTz.zonedTimeToUtc(`${slots_date} 23:00`, business.timezone))]: false,
      }

      const actual = slotAvailability({
        business,
        slotTimeRanges,
        slotsObj,
        slotTimeOverrides,
        humanReadableDate: true,
      })

      const expected = [
        {
          available: true,
          humanReadableDate: '2021-04-20T11:00',
          slot_date: 1618930800000,
        },
        {
          available: false,
          humanReadableDate: '2021-04-20T23:00',
          slot_date: 1618974000000,
        },
      ]

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('slotTimeRangeToKey', () => {
    it('should return a unique string for the slots time range', async () => {
      const slots_date = '2021-04-20'
      const slot_time_range = {
        slots_date,
        slots_start_time: '11:00',
        slots_end_time: '22:00',
      }
      const actual = slotTimeRangeToKey(slot_time_range)
      expect(actual).to.eq('2021-04-20-11:00-22:00')
    })
  })

  describe.skip('getAvailabilityAndParse', () => {
    it.skip('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally
      const party_size = 4
      const check_dow = 'tuesday'
      const check_time = '15:00'
      const { batch, business } = await setup()

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id,
        cohort_external_id: batch.cohort_external_id,
        cohort_id: batch.cohort_id,
        party_size,
        check_dow,
        check_time,

        slotTimeRanges: [
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '22:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '22:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '22:00',
          },
        ],
        humanReadableDate: true,
      })

      logger.debug(JSON.stringify(actual, null, 2))
      logger.debug(business.url)
    })
  })

  describe.skip('availableSlotTimesUTC', () => {
    it('should ', async () => {
      expect(true).to.eq(false)
    })
  })

  describe.skip('slotAvailability', () => {
    it('should ', async () => {
      expect(true).to.eq(false)
    })
  })

  describe.skip('markUnavailable', () => {
    it('should ', async () => {
      expect(true).to.eq(false)
    })
  })
})
