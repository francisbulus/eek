import logger from '@invisible/logger'
import { expect } from 'chai'
import * as dateFns from 'date-fns'
import fs from 'fs'
import { isArray, times } from 'lodash/fp'

import { prisma } from '../../config/prisma'
import type { ISlotTimeRange, IValidSevenroomsBusiness } from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'
import { seedAll as seed } from '../../prisma/seedHelpers'
import * as DATA from '../../test/fixtures/sevenrooms/api-result.json'
import * as DATA_MULTIPLE_DATES from '../../test/fixtures/sevenrooms/api-result-multiple-dates.json'
import * as DATA_SEVENROOMS_TIMES from '../../test/fixtures/sevenrooms/sevenrooms-times.json'
import type { ISevenroomsApiResult, ISevenroomsTime } from './api'
import {
  availableSlotTimesUTC,
  getAvailabilityAndParse,
  getSevenroomsData,
  getSevenroomsDataForOneRange,
  sevenroomsUrl,
  slotAvailability,
} from './api'

const setup = async () => {
  const external_id = 7692
  const business = await prisma.business.findFirst({ where: { external_id } })
  if (!business) {
    throw new Error(`Seed data failed, no restaurant found with external_id: ${external_id}`)
  }

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

  const slots_date = '2021-10-23'
  const slots_start_time = '17:00'
  const slots_end_time = '21:00'
  const party_size = 2

  const sevenroomTimes = DATA_SEVENROOMS_TIMES.times as ISevenroomsTime[]

  return {
    business: business as IValidSevenroomsBusiness,
    data: { ...(DATA as ISevenroomsApiResult) },
    dataMultipleDates: { ...(DATA_MULTIPLE_DATES as ISevenroomsApiResult) },
    intermediateResult: {
      ...(DATA_SEVENROOMS_TIMES as {
        times: ISevenroomsTime[]
        actualSlotTimeRanges: ISlotTimeRange[]
      }),
    },
    sevenroomTimes,
    slots_date,
    slots_start_time,
    slots_end_time,
    party_size,
    batch,
  }
}

const randomSevenroomsBusinesses = async (n = 1) => {
  const ids = await prisma.business.findMany({
    where: { platform: PLATFORMS.SEVENROOMS, cohort_id: { not: 99999999 } },
    select: { id: true },
  })

  const randIds = times(() => ids[Math.floor(Math.random() * ids.length)].id, n)

  return (await prisma.business.findMany({
    where: { id: { in: randIds } },
    take: n,
  })) as IValidSevenroomsBusiness[]
}

describe('sevenrooms', () => {
  before(async () => {
    await seed()
  })

  describe('sevenroomsUrl', () => {
    it('should generate the correct url', async () => {
      const actual = sevenroomsUrl({
        venue: 'empellontaqueria',
        time_slot: '19:30',
        party_size: 2,
        start_date: '08-01-2021',
        num_days: 3,
      })

      const expected = `https://www.sevenrooms.com/api-yoa/availability/widget/range?venue=empellontaqueria&time_slot=19:30&party_size=2&halo_size_interval=16&start_date=08-01-2021&num_days=3&channel=SEVENROOMS_WIDGET`

      expect(actual).to.eq(expected)
    })
  })

  describe.skip('getSevenroomsDataForOneRange', () => {
    // Warning, this test makes an actual network call, so it should be skipped for CI and only run locally
    it.skip('should get the sevenrooms api data', async () => {
      const { business } = await setup()
      const slots_date = dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd')
      const actual = (
        await getSevenroomsDataForOneRange({
          business,
          party_size: 2,
          slot_time_range: {
            slots_date,
            slots_start_time: '20:00',
            slots_end_time: '23:00',
          },
        })
      )[0]

      logger.debug(JSON.stringify(actual.data, null, 2))

      expect(Boolean(actual.data.availability)).to.eq(true, 'actual.data.availability')
      expect(Boolean(actual.data.availability[slots_date])).to.eq(
        true,
        'actual.data.availability[slots_date]'
      )
      expect(isArray(actual.data.availability[slots_date])).to.eq(
        true,
        'actual.data.availability[slots_date] is array'
      )
      expect(Boolean(actual.data.availability[slots_date][0])).to.eq(
        true,
        'actual.data.availability[slots_date][0]'
      )
      expect(isArray(actual.data.availability[slots_date][0].times)).to.eq(
        true,
        'actual.data.availability[slots_date][0].times is array'
      )
      expect(Boolean(actual.data.availability[slots_date][0].times[0])).to.eq(
        true,
        'actual.data.availability[slots_date][0].times[0]'
      )
      expect(Boolean(actual.data.availability[slots_date][0].times[0].utc_datetime)).to.eq(
        true,
        'actual.data.availability[slots_date][0].times[0].utc_datetime'
      )
    })
  })

  describe.skip('getSevenroomsData', () => {
    it('should get the availability of the given restaurant for multiple ranges', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const business = (await randomSevenroomsBusinesses())[0]
      const party_size = 2

      const actual = await getSevenroomsData({
        business,
        party_size,
        slotTimeRanges: [
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
        ],
        useProxy: true,
      })

      fs.writeFileSync(`${__dirname}/../../ignore/sevenrooms.json`, JSON.stringify(actual, null, 2))
      logger.debug(actual)
      logger.debug(business.url)
    })
  })

  describe('availableSlotTimesUTC', () => {
    it('should return an array of available slot times, in UTC', async () => {
      const { sevenroomTimes, business } = await setup()

      if (!business) throw new Error()
      const actual = await availableSlotTimesUTC({
        times: sevenroomTimes,
        business,
        slotTimeRanges: [
          {
            slots_date: '2021-07-28',
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
          {
            slots_date: '2021-07-29',
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
          {
            slots_date: '2021-07-30',
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
        ],
      })

      const expected = [
        dateFns.parseISO('2021-07-28T20:00:00.000Z'),
        dateFns.parseISO('2021-07-28T20:15:00.000Z'),
        dateFns.parseISO('2021-07-29T20:00:00.000Z'),
        dateFns.parseISO('2021-07-29T20:15:00.000Z'),
        dateFns.parseISO('2021-07-30T20:00:00.000Z'),
        dateFns.parseISO('2021-07-30T20:15:00.000Z'),
      ]

      expect(actual).to.deep.eq(expected)
    })

    it('should return an array of available slot times, in UTC', async () => {
      const {
        business,
        intermediateResult,
        slots_date,
        slots_start_time,
        slots_end_time,
      } = await setup()

      if (!business) throw new Error()
      const actual = await availableSlotTimesUTC({
        times: intermediateResult.times,
        business,
        slotTimeRanges: [{ slots_date, slots_start_time, slots_end_time }],
      })

      const expected: any = [
        dateFns.parseISO('2021-07-28T20:00:00.000Z'),
        dateFns.parseISO('2021-07-28T20:15:00.000Z'),
        dateFns.parseISO('2021-07-29T20:00:00.000Z'),
        dateFns.parseISO('2021-07-29T20:15:00.000Z'),
        dateFns.parseISO('2021-07-30T20:00:00.000Z'),
        dateFns.parseISO('2021-07-30T20:15:00.000Z'),
      ]

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('slotAvailability', () => {
    it('should correctly parse availability data from api response', async () => {
      const { business, sevenroomTimes } = await setup()
      const actual = slotAvailability({
        business,
        times: sevenroomTimes,
        slotTimeRanges: [
          {
            slots_date: '2021-07-28',
            slots_start_time: '15:00',
            slots_end_time: '17:00',
          },
          {
            slots_date: '2021-07-29',
            slots_start_time: '15:00',
            slots_end_time: '17:00',
          },
          {
            slots_date: '2021-07-30',
            slots_start_time: '15:00',
            slots_end_time: '17:00',
          },
        ],
      })

      const expected = [
        { slot_date: 1627498800000, available: false, seating: [] },
        { slot_date: 1627499700000, available: false, seating: [] },
        { slot_date: 1627500600000, available: false, seating: [] },
        { slot_date: 1627501500000, available: false, seating: [] },
        { slot_date: 1627502400000, available: true, seating: [] },
        { slot_date: 1627503300000, available: true, seating: [] },
        { slot_date: 1627504200000, available: false, seating: [] },
        { slot_date: 1627505100000, available: false, seating: [] },
        { slot_date: 1627506000000, available: false, seating: [] },
        { slot_date: 1627585200000, available: false, seating: [] },
        { slot_date: 1627586100000, available: false, seating: [] },
        { slot_date: 1627587000000, available: false, seating: [] },
        { slot_date: 1627587900000, available: false, seating: [] },
        { slot_date: 1627588800000, available: true, seating: [] },
        { slot_date: 1627589700000, available: true, seating: [] },
        { slot_date: 1627590600000, available: false, seating: [] },
        { slot_date: 1627591500000, available: false, seating: [] },
        { slot_date: 1627592400000, available: false, seating: [] },
        { slot_date: 1627671600000, available: false, seating: [] },
        { slot_date: 1627672500000, available: false, seating: [] },
        { slot_date: 1627673400000, available: false, seating: [] },
        { slot_date: 1627674300000, available: false, seating: [] },
        { slot_date: 1627675200000, available: true, seating: [] },
        { slot_date: 1627676100000, available: true, seating: [] },
        { slot_date: 1627677000000, available: false, seating: [] },
        { slot_date: 1627677900000, available: false, seating: [] },
        { slot_date: 1627678800000, available: false, seating: [] },
      ]

      expect(actual).to.deep.eq(expected)
    })
  })

  describe.skip('getAvailabilityAndParse', () => {
    it.skip('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const { batch, business } = await setup()
      const party_size = 2
      const check_dow = 'tuesday'
      const check_time = '15:00'

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id!,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        party_size,
        check_dow,
        check_time,
        slotTimeRanges: [
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '21:45',
          },
        ],
        humanReadableDate: true,
      })

      fs.writeFileSync(
        `${__dirname}/../../ignore/sevenrooms-seated.json`,
        JSON.stringify(actual, null, 2)
      )
      logger.debug(actual)
      logger.debug(business.url)
    })

    it('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const { batch, business } = await setup()
      const party_size = 2
      const check_dow = 'wednesday'
      const check_time = '10:00'

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id!,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        party_size,
        check_dow,
        check_time,
        slotTimeRanges: [
          { slots_date: '2021-08-01', slots_start_time: '17:00', slots_end_time: '21:45' },
        ],
        humanReadableDate: true,
      })

      fs.writeFileSync(
        `${__dirname}/../../ignore/sevenrooms-seated.json`,
        JSON.stringify(actual, null, 2)
      )
      logger.debug(actual)
      logger.debug(business!.url)
    })
  })
})
