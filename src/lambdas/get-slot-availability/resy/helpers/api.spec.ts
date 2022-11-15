import logger from '@invisible/logger'
import { expect } from 'chai'
import * as dateFns from 'date-fns'
import { compact, filter, flatten, map, reduce, times } from 'lodash/fp'
import timekeeper from 'timekeeper'

import { prisma } from '../../config/prisma'
import { epochMs } from '../../helpers/date'
import type { IValidResyBusiness } from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'
import { seedAll as seed } from '../../prisma/seedHelpers'
import * as DATA from '../../test/fixtures/resy/api-result.json'
import * as DATA_NO_SLOTS from '../../test/fixtures/resy/api-result-no-slots.json'
import OUTPUT from '../../test/fixtures/resy/output-for-seated.json'
import type { IResyApiResult, IResySlot } from './api'
import {
  addSeating,
  availableSlotTimesUTC,
  getAvailabilityAndParse,
  getResyData,
  parseResultsForSeated,
  slotAvailability,
} from './api'

const setup = async () => {
  const external_id = 7409
  const business = await prisma.business.findFirst({ where: { external_id } })
  if (!business) {
    throw new Error(`Seed data failed, no restaurant found with external_id: ${external_id}`)
  }

  const slots_date = '2021-06-18'
  const slots_start_time = '17:00'
  const slots_end_time = '21:00'
  const party_size = 2
  const slots: IResySlot[] = flatten(compact(map('slots', DATA.results.venues ?? [])))

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
    batch,
    business: business as IValidResyBusiness,
    data: { ...(DATA as IResyApiResult) },
    dataNoSlots: { ...(DATA_NO_SLOTS as IResyApiResult) },
    slots,
    slots_date,
    slots_start_time,
    slots_end_time,
    party_size,
  }
}

const randomResyBusinesses = async (n = 1) => {
  const ids = await prisma.business.findMany({
    where: { platform: PLATFORMS.RESY, cohort_id: { not: 99999999 } },
    select: { id: true },
  })

  const randIds = times(() => ids[Math.floor(Math.random() * ids.length)].id, n)

  return (await prisma.business.findMany({
    where: { id: { in: randIds } },
    take: n,
  })) as IValidResyBusiness[]
}

describe('seated', () => {
  before(async () => {
    await seed()
  })
  describe.skip('getResyData', () => {
    it('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const business = (await randomResyBusinesses())[0]
      const slots_start_time = '17:00'
      const slots_end_time = '21:00'
      const party_size = 2

      const actual = await getResyData({
        business,
        slotTimeRanges: [
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd'),
            slots_start_time,
            slots_end_time,
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time,
            slots_end_time,
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time,
            slots_end_time,
          },
        ],
        party_size,
      })

      logger.debug(JSON.stringify(actual, null, 2))
    })
  })

  describe.skip('getAvailabilityAndParse', () => {
    it.skip('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const { batch, business } = await setup()
      const slots_start_time = '17:00'
      const slots_end_time = '21:00'
      const party_size = 2
      const check_dow = 'tuesday'
      const check_time = '15:00'

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        party_size,
        humanReadableDate: true,
        check_dow,
        check_time,
        slotTimeRanges: [
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd'),
            slots_start_time,
            slots_end_time,
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time,
            slots_end_time,
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time,
            slots_end_time,
          },
        ],
      })

      logger.debug(JSON.stringify(actual ?? {}, null, 2))
      logger.debug(business.url)
    })

    it.skip('concurrency test', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally
      const businesses = await randomResyBusinesses(100)
      const date_to_check = dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd')
      const party_size = 4
      const check_dow = 'tuesday'
      const check_time = '15:00'
      const { batch } = await setup()

      const actual = compact(
        await Promise.all(
          map(
            (biz) =>
              getAvailabilityAndParse({
                batch_id: batch.id,
                check_dow,
                check_time,
                cohort_id: batch.cohort_id,
                cohort_external_id: batch.cohort_external_id,
                external_id: biz.external_id,
                party_size,
                slotTimeRanges: [
                  {
                    slots_date: date_to_check,
                    slots_start_time: '17:00',
                    slots_end_time: '23:00',
                  },
                ],
                humanReadableDate: true,
              }).catch((err) => {
                logger.error(err, biz)
                return undefined
              }),
            businesses
          )
        )
      )

      logger.debug(JSON.stringify(actual))
    })
  })

  describe('addSeating', () => {
    it('should add the seating', async () => {
      const { data } = await setup()

      const actual = addSeating(flatten(map('slots', data.results.venues)))

      // Some checks. You can verify in the fixture that these are correct
      expect(actual[0]).to.deep.eq({
        date: { start: '2021-06-18 17:00:00', end: '2021-06-18 18:45:00' },
        seating: ['Backyard', 'Front Patio'],
      })

      expect(actual[1]).to.deep.eq({
        date: { end: '2021-06-18 19:00:00', start: '2021-06-18 17:15:00' },
        seating: ['Backyard', 'Front Patio'],
      })

      // This time was only available for the Front Patio
      expect(actual[10]).to.deep.eq({
        date: { end: '2021-06-18 21:45:00', start: '2021-06-18 20:00:00' },
        seating: ['Front Patio'],
      })
    })
  })

  describe('addSeating', () => {
    it('should add the seating', async () => {
      const { data } = await setup()

      const actual = addSeating(flatten(map('slots', data.results.venues)))

      // Some checks. You can verify in the fixture that these are correct
      expect(actual[0]).to.deep.eq({
        date: { start: '2021-06-18 17:00:00', end: '2021-06-18 18:45:00' },
        seating: ['Backyard', 'Front Patio'],
      })

      expect(actual[1]).to.deep.eq({
        date: { end: '2021-06-18 19:00:00', start: '2021-06-18 17:15:00' },
        seating: ['Backyard', 'Front Patio'],
      })

      // This time was only available for the Front Patio
      expect(actual[10]).to.deep.eq({
        date: { end: '2021-06-18 21:45:00', start: '2021-06-18 20:00:00' },
        seating: ['Front Patio'],
      })
    })
  })

  describe('availableSlotTimesUTC', () => {
    it('should return an array of available slot times, in UTC', async () => {
      const { slots, business, slots_date, slots_start_time, slots_end_time } = await setup()

      if (!business) throw new Error()
      const actual = await availableSlotTimesUTC({
        slots,
        business,
        slotTimeRanges: [{ slots_date, slots_start_time, slots_end_time }],
      })

      const expected = [
        dateFns.parseISO('2021-06-18T21:00:00.000Z'),
        dateFns.parseISO('2021-06-18T21:00:00.000Z'),
        dateFns.parseISO('2021-06-18T21:15:00.000Z'),
        dateFns.parseISO('2021-06-18T21:15:00.000Z'),
        dateFns.parseISO('2021-06-18T21:30:00.000Z'),
        dateFns.parseISO('2021-06-18T21:45:00.000Z'),
        dateFns.parseISO('2021-06-18T22:00:00.000Z'),
        dateFns.parseISO('2021-06-18T22:15:00.000Z'),
        dateFns.parseISO('2021-06-18T22:30:00.000Z'),
        dateFns.parseISO('2021-06-18T22:45:00.000Z'),
        dateFns.parseISO('2021-06-18T23:00:00.000Z'),
        dateFns.parseISO('2021-06-18T23:30:00.000Z'),
        dateFns.parseISO('2021-06-19T00:00:00.000Z'),
        dateFns.parseISO('2021-06-19T00:15:00.000Z'),
        dateFns.parseISO('2021-06-19T00:15:00.000Z'),
        dateFns.parseISO('2021-06-19T00:45:00.000Z'),
        dateFns.parseISO('2021-06-19T01:00:00.000Z'),
        dateFns.parseISO('2021-06-19T01:15:00.000Z'),
        dateFns.parseISO('2021-06-19T01:30:00.000Z'),
        dateFns.parseISO('2021-06-19T01:45:00.000Z'),
        dateFns.parseISO('2021-06-19T02:00:00.000Z'),
      ]

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('parseResultsForSeated', () => {
    beforeEach(() => timekeeper.freeze(new Date()))
    afterEach(() => timekeeper.reset())

    it('should parse the resy results for seated', async () => {
      const {
        slots,
        business,
        slots_date,
        slots_start_time,
        slots_end_time,
        party_size,
      } = await setup()
      if (!business) throw new Error()

      const slotsWithSeating = addSeating(slots)

      const actual = await parseResultsForSeated({
        slots: slotsWithSeating,
        business,
        party_size,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time,
            slots_end_time,
          },
        ],
      })

      const now = epochMs(new Date())

      const expected = {
        business_id: 7409,
        business_name: 'Bar Camillo',
        interval: 15,
        time_of_check: now,
        site_checked: 'resy',
        data: [
          {
            party_size: 2,
            slots: [
              { slot_date: 1624050000000, seating: ['Backyard', 'Front Patio'], available: true },
              { slot_date: 1624050900000, seating: ['Backyard', 'Front Patio'], available: true },
              { slot_date: 1624051800000, seating: ['Front Patio'], available: true },
              { slot_date: 1624052700000, seating: ['Front Patio'], available: true },
              { slot_date: 1624053600000, seating: ['Front Patio'], available: true },
              { slot_date: 1624054500000, seating: ['Front Patio'], available: true },
              { slot_date: 1624055400000, seating: ['Front Patio'], available: true },
              { slot_date: 1624056300000, seating: ['Front Patio'], available: true },
              { slot_date: 1624057200000, seating: ['Front Patio'], available: true },
              { slot_date: 1624058100000, seating: [], available: false },
              { slot_date: 1624059000000, seating: ['Front Patio'], available: true },
              { slot_date: 1624059900000, seating: [], available: false },
              { slot_date: 1624060800000, seating: ['Front Patio'], available: true },
              { slot_date: 1624061700000, seating: ['Backyard', 'Front Patio'], available: true },
              { slot_date: 1624062600000, seating: [], available: false },
              { slot_date: 1624063500000, seating: ['Backyard'], available: true },
              { slot_date: 1624064400000, seating: ['Backyard'], available: true },
            ],
          },
        ],
      }

      // outputYupSchema.validateSync(expected)
      expect(actual).to.deep.eq(expected)
    })
  })
})

describe('resy', () => {
  before(async () => {
    await seed()
  })

  describe('slotAvailability', () => {
    it('should return all slot availabilities in seated format', async () => {
      const { business, slots, slots_date, slots_end_time, slots_start_time } = await setup()
      const slotsWithSeating = addSeating(slots)
      const actual = slotAvailability({
        slots: slotsWithSeating,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time,
            slots_end_time,
          },
        ],
        business,
      })
      const expected = [
        { slot_date: 1624050000000, seating: ['Backyard', 'Front Patio'], available: true },
        { slot_date: 1624050900000, seating: ['Backyard', 'Front Patio'], available: true },
        { slot_date: 1624051800000, seating: ['Front Patio'], available: true },
        { slot_date: 1624052700000, seating: ['Front Patio'], available: true },
        { slot_date: 1624053600000, seating: ['Front Patio'], available: true },
        { slot_date: 1624054500000, seating: ['Front Patio'], available: true },
        { slot_date: 1624055400000, seating: ['Front Patio'], available: true },
        { slot_date: 1624056300000, seating: ['Front Patio'], available: true },
        { slot_date: 1624057200000, seating: ['Front Patio'], available: true },
        { slot_date: 1624058100000, seating: [], available: false },
        { slot_date: 1624059000000, seating: ['Front Patio'], available: true },
        { slot_date: 1624059900000, seating: [], available: false },
        { slot_date: 1624060800000, seating: ['Front Patio'], available: true },
        { slot_date: 1624061700000, seating: ['Backyard', 'Front Patio'], available: true },
        { slot_date: 1624062600000, seating: [], available: false },
        { slot_date: 1624063500000, seating: ['Backyard'], available: true },
        { slot_date: 1624064400000, seating: ['Backyard'], available: true },
      ]
      expect(actual.length).to.eq(17) // 15 min intervals between 17:00 and 21:00 inclusive
      expect(actual).to.deep.eq(expected)
    })

    it('should return all false if no slots given', async () => {
      const { business, slots_date, slots_end_time, slots_start_time } = await setup()
      const actual = slotAvailability({
        slots: [],
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time,
            slots_end_time,
          },
        ],
        business,
      })
      const expected = [
        { slot_date: 1624050000000, seating: [], available: false },
        { slot_date: 1624050900000, seating: [], available: false },
        { slot_date: 1624051800000, seating: [], available: false },
        { slot_date: 1624052700000, seating: [], available: false },
        { slot_date: 1624053600000, seating: [], available: false },
        { slot_date: 1624054500000, seating: [], available: false },
        { slot_date: 1624055400000, seating: [], available: false },
        { slot_date: 1624056300000, seating: [], available: false },
        { slot_date: 1624057200000, seating: [], available: false },
        { slot_date: 1624058100000, seating: [], available: false },
        { slot_date: 1624059000000, seating: [], available: false },
        { slot_date: 1624059900000, seating: [], available: false },
        { slot_date: 1624060800000, seating: [], available: false },
        { slot_date: 1624061700000, seating: [], available: false },
        { slot_date: 1624062600000, seating: [], available: false },
        { slot_date: 1624063500000, seating: [], available: false },
        { slot_date: 1624064400000, seating: [], available: false },
      ]
      expect(actual.length).to.eq(17) // 15 min intervals between 17:00 and 21:00 inclusive
      expect(actual).to.deep.eq(expected)
    })
  })
})

describe('output check', () => {
  it('should do stuff', async () => {
    const allFalse = filter((biz) => {
      const slots = flatten(map('slots', biz.data))
      return !reduce((acc: boolean, slot) => Boolean(acc || slot.available), false, slots)
    }, OUTPUT)

    expect(allFalse.length).to.eq(19)

    const bizIds = map('business_id', allFalse)
    expect(bizIds).to.deep.eq([
      7198,
      5830,
      4294,
      376,
      264,
      1604,
      8641,
      8652,
      8809,
      6883,
      9032,
      8966,
      8969,
      8978,
      9035,
      9022,
      8853,
      9152,
      9204,
    ])
  })
})
