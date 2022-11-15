import logger from '@invisible/logger'
import { expect } from 'chai'
import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'
import fs from 'fs'
import { compact, each, find, flatten, includes, map, reduce } from 'lodash/fp'
import type { Business, day_of_week_names } from 'prisma-seated'
import { scrape_statuses } from 'prisma-seated'
import timekeeper from 'timekeeper'

import { prisma } from '../../config/prisma'
import { epochMs } from '../../helpers/date'
import { allSlotTimes } from '../../helpers/slot'
import type { IValidOpentableBusiness } from '../../helpers/types'
import { seedAll as seed } from '../../prisma/seedHelpers'
import PAYLOAD from '../../test/fixtures/helpers/seated-payload-2.json'
import * as DATA from '../../test/fixtures/opentable/api-result.json'
import * as DATA_ABOVE_MAX_PARTY_SIZE from '../../test/fixtures/opentable/api-result-above-max-party-size.json'
import * as DATA_NO_SERVICE from '../../test/fixtures/opentable/api-result-no-service.json'
import * as DATA_NO_SLOTS from '../../test/fixtures/opentable/api-result-no-slots.json'
import * as DATA_NOT_ACTIVE from '../../test/fixtures/opentable/api-result-not-active.json'
import SLOTS_OBJ from '../../test/fixtures/opentable/slots-obj.json'
import SLOTS_OBJ_WITH_SEATING from '../../test/fixtures/opentable/slots-obj-with-seating.json'
import type { IOpentableApiResult, ISlotsObj } from './api'
import {
  aboveMaxPartySize,
  getAvailabilityAndParse,
  getOpentableData,
  markAllUnavailable,
  markUnavailable,
  noAvailability,
  noService,
  otFormat,
  parseResultsForSeated,
  slotAvailability,
} from './api'
import { randomOpentableBusinesses } from './randomBusinesses'

const {
  success: SUCCESS,
  processing: PROCESSING,
  done_incomplete: DONE_INCOMPLETE,
} = scrape_statuses

const setup = async () => {
  const external_id = 37
  const business = await prisma.business.findFirst({
    where: { external_id, archived_at: null },
    orderBy: { id: 'desc' },
  })
  if (!business) {
    throw new Error(`Seed data failed, no restaurant found with external_id: ${external_id}`)
  }

  const check_time = '09:00'
  const check_dow: day_of_week_names = 'friday'
  const cohort_id = 4
  const cohort_external_id = 4

  const batch = await prisma.batch.create({
    data: {
      check_date: new Date(),
      check_time,
      check_dow,
      cohort_id,
      cohort_external_id,
      num_businesses: 1,
      slots_per_run: 20,
      num_party_sizes: 2,
      expected_num_slots: 40,
    },
  })

  const slots_date = '2021-07-16'
  const slots_start_time = '13:00'
  const slots_end_time = '21:00'
  const party_size = 2

  const slotsObj: Record<string, boolean | null> = {
    ...reduce(
      (acc, slot) => {
        return { ...acc, [slot.dateTime]: true }
      },
      {},
      flatten(compact(map('timeSlots', DATA.availability)))
    ),

    '2021-07-16T13:00': false,
    '2021-07-16T13:15': false,
    '2021-07-16T13:30': false,
    '2021-07-16T13:45': false,
    '2021-07-16T14:00': false,
    '2021-07-16T14:15': false,
    '2021-07-16T14:30': false,
    '2021-07-16T14:45': false,
    '2021-07-16T15:00': false,
    '2021-07-16T15:15': false,
    '2021-07-16T15:30': false,
    '2021-07-16T15:45': false,
    '2021-07-16T16:00': false,
    '2021-07-16T16:15': false,
  }

  const slotsObjWithSeating: Record<string, string[] | null> = {
    ...reduce(
      (acc, slot) => {
        return { ...acc, [slot.dateTime]: [] }
      },
      {},
      flatten(compact(map('timeSlots', DATA.availability)))
    ),

    '2021-07-16T13:00': ['others'],
    '2021-07-16T13:15': ['others'],
    '2021-07-16T13:30': ['others'],
    '2021-07-16T13:45': ['others'],
    '2021-07-16T14:00': ['others'],
    '2021-07-16T14:15': ['others'],
    '2021-07-16T14:30': ['others'],
    '2021-07-16T14:45': ['others'],
    '2021-07-16T15:00': ['others'],
    '2021-07-16T15:15': ['others'],
    '2021-07-16T15:30': ['others'],
    '2021-07-16T15:45': ['others'],
    '2021-07-16T16:00': ['others'],
    '2021-07-16T16:15': ['others'],
  }

  return {
    batch,
    business: business as IValidOpentableBusiness,
    check_dow,
    check_time,
    cohort_external_id,
    cohort_id,
    data: { ...(DATA as IOpentableApiResult) },
    party_size,
    slots_date,
    slots_end_time,
    slots_start_time,
    slotsObj,
    slotsObjWithSeating,
  }
}

const setupSlotTimeRanges = ({
  slots_date,
  business,
}: {
  slots_date: string
  business: Business
}) => ({
  slotTimeOverrides: [
    dateFnsTz.zonedTimeToUtc(`${slots_date}T17:00:00`, business.timezone),
    dateFnsTz.zonedTimeToUtc(`${slots_date}T17:15:00`, business.timezone),
    dateFnsTz.zonedTimeToUtc(`${slots_date}T19:30:00`, business.timezone),
    dateFnsTz.zonedTimeToUtc(`${slots_date}T20:00:00`, business.timezone),
  ],
  slotTimeRanges: [
    {
      slots_date,
      slots_start_time: '17:00',
      slots_end_time: '21:00',
    },
    {
      slots_date: dateFns.format(
        dateFns.addDays(dateFns.parse(slots_date, 'yyyy-MM-dd', new Date()), 1),
        'yyyy-MM-dd'
      ),
      slots_start_time: '12:00',
      slots_end_time: '21:00',
    },
  ],
})

describe('opentable', () => {
  before(async () => {
    await seed()
  })

  describe.skip('getOpentableData', () => {
    it('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const business = (await randomOpentableBusinesses())[0]
      const slots_date = dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd')
      const party_size = 2

      const actual = await getOpentableData({
        business,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
        ],
        party_size,
        useProxy: true,
      })

      logger.debug(JSON.stringify(actual.slotsObj, null, 2))
      fs.writeFileSync(`${__dirname}/../../ignore/opentable.json`, JSON.stringify(actual, null, 2))
    })

    it.skip('should scrape just the time slots passed in if slotTimeOverrides is present', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const business = (await randomOpentableBusinesses())[0]
      const slots_date = dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd')
      const party_size = 2

      const { slotTimeRanges, slotTimeOverrides } = setupSlotTimeRanges({ slots_date, business })

      const actual = await getOpentableData({
        business,
        slotTimeOverrides,
        slotTimeRanges,
        party_size,
        useProxy: true,
      })

      logger.debug(JSON.stringify(actual.slotsObj, null, 2))
      fs.writeFileSync(`${__dirname}/../../ignore/opentable.json`, JSON.stringify(actual, null, 2))
    })

    it.skip('concurrency test, multiple slot time ranges', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      // const business = (await randomOpentableBusinesses())[0]
      const { business } = await setup()
      const slots_date = dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd')
      const party_size = 2

      const actual = await getOpentableData({
        business,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time: '11:00',
            slots_end_time: '14:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time: '12:00',
            slots_end_time: '14:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
          {
            slots_date: dateFns.format(dateFns.addDays(new Date(), 4), 'yyyy-MM-dd'),
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
        ],
        party_size,
        useProxy: true,
      })

      logger.debug(JSON.stringify(actual.slotsObj, null, 2))
      logger.debug(actual.numRequests)
      fs.writeFileSync(`${__dirname}/../../ignore/opentable.json`, JSON.stringify(actual, null, 2))
    })

    it.skip('concurrency test, multiple restaurants, multiple slot time ranges', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const businesses = await randomOpentableBusinesses(5)

      // const business: any = await prisma.business.findUnique({ where: { id: 1121 }})
      const slots_date = dateFns.format(dateFns.addDays(new Date(), 1), 'yyyy-MM-dd')
      const party_size = 2

      const actual = compact(
        await Promise.all(
          map(
            (biz) =>
              getOpentableData({
                business: biz,
                slotTimeRanges: [
                  {
                    slots_date,
                    slots_start_time: '17:00',
                    slots_end_time: '21:00',
                  },
                  {
                    slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
                    slots_start_time: '11:00',
                    slots_end_time: '14:00',
                  },
                  {
                    slots_date: dateFns.format(dateFns.addDays(new Date(), 2), 'yyyy-MM-dd'),
                    slots_start_time: '17:00',
                    slots_end_time: '21:00',
                  },
                  {
                    slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
                    slots_start_time: '12:00',
                    slots_end_time: '14:00',
                  },
                  {
                    slots_date: dateFns.format(dateFns.addDays(new Date(), 3), 'yyyy-MM-dd'),
                    slots_start_time: '17:00',
                    slots_end_time: '21:00',
                  },
                  {
                    slots_date: dateFns.format(dateFns.addDays(new Date(), 4), 'yyyy-MM-dd'),
                    slots_start_time: '17:00',
                    slots_end_time: '21:00',
                  },
                ],
                party_size,
                useProxy: true,
              }),
            businesses
          )
        )
      )

      logger.debug(JSON.stringify(actual, null, 2))
      fs.writeFileSync(`${__dirname}/../../ignore/opentable.json`, JSON.stringify(actual, null, 2))
    })
  })

  describe('getAvailabilityAndParse', () => {
    const generatePayload = (slots_date: string) => {
      const payload = { ...PAYLOAD }
      each((d) => {
        each((slot) => {
          const dateString = `${slots_date}${slot.humanReadableDate.substring(10)}`
          slot.humanReadableDate = dateString
          const newDate = dateFnsTz.zonedTimeToUtc(dateString, 'America/New_York')
          slot.slot_date = epochMs(newDate)
        }, d.slots)
      }, payload.data)
      return payload
    }

    const setup2 = async ({
      success = false,
      processing = false,
      done_incomplete = false,
      slots_date,
    }: {
      success?: boolean
      processing?: boolean
      done_incomplete?: boolean
      slots_date: string
    }) => {
      const party_size = 4

      const {
        business,
        batch,
        check_time,
        check_dow,
        cohort_id,
        cohort_external_id,
      } = await setup()

      const create = async (scrape_status: scrape_statuses, payload = {}, created_at?: Date) =>
        prisma.run.create({
          data: {
            batch_id: batch.id,
            business_id: business.id,
            check_dow,
            check_time,
            cohort_external_id,
            cohort_id,
            deleted_at: null,
            party_size,
            test_mode: false,
            scrape_status,
            payload,
            created_at,
          },
        })

      const payload1 = generatePayload(slots_date)
      const payload2 = generatePayload(slots_date)
      const payload3 = generatePayload(slots_date)

      payload2.time_of_check = 16369576011234
      payload2.data = [
        {
          // These slots don't exist in payload1 because payload1 has no party_size of 2
          party_size: 2,
          slots: [
            {
              available: false,
              humanReadableDate: `${slots_date}T18:00`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T18:00`, 'America/New_York')
              ),
            },
            {
              available: true,
              humanReadableDate: `${slots_date}T22:30`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T22:30`, 'America/New_York')
              ),
            },
          ],
        },
      ]

      payload3.time_of_check = 16369576019999
      payload3.data = [
        {
          party_size: 4,
          slots: [
            {
              available: true, // This should override payload1
              humanReadableDate: `${slots_date}T17:00`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T17:00`, 'America/New_York')
              ),
            },
            {
              available: false, // This should override payload1
              humanReadableDate: `${slots_date}T18:00`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T18:00`, 'America/New_York')
              ),
            },
            {
              available: false,
              humanReadableDate: `${slots_date}T18:15`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T18:15`, 'America/New_York')
              ),
            },
            {
              available: false,
              humanReadableDate: `${slots_date}T18:30`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T18:30`, 'America/New_York')
              ),
            },
            {
              available: false,
              humanReadableDate: `${slots_date}T18:45`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T18:45`, 'America/New_York')
              ),
            },
            {
              available: false,
              humanReadableDate: `${slots_date}T19:00`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T19:00`, 'America/New_York')
              ),
            },
            {
              available: false,
              humanReadableDate: `${slots_date}T19:15`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T19:15`, 'America/New_York')
              ),
            },
            {
              available: false,
              humanReadableDate: `${slots_date}T19:30`,
              slot_date: epochMs(
                dateFnsTz.zonedTimeToUtc(`${slots_date}T19:30`, 'America/New_York')
              ),
            },
          ],
        },
      ]

      const successRun = success ? await create(SUCCESS, payload1) : undefined
      const processingRun = processing ? await create(PROCESSING) : undefined
      const doneIncompleteRuns = done_incomplete
        ? await Promise.all([
            create(DONE_INCOMPLETE, payload3, new Date('2021-07-03')),
            create(DONE_INCOMPLETE, payload1, new Date('2021-07-01')),
            create(DONE_INCOMPLETE, payload2, new Date('2021-07-02')),
          ])
        : undefined

      return {
        slots_date,
        party_size,
        business,
        batch,
        check_time,
        check_dow,
        cohort_id,
        cohort_external_id,
        successRun,
        processingRun,
        doneIncompleteRuns,
      }
    }

    it.skip('should get the availability of the given restaurant', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const business = (await randomOpentableBusinesses())[0]
      const slots_date = dateFns.format(new Date(), 'yyyy-MM-dd')
      const party_size = 4
      const check_dow = 'tuesday'
      const check_time = '15:00'
      const { batch } = await setup()

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id,
        party_size,
        check_dow,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        check_time,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
        ],
        useProxy: true,
      })

      logger.debug(JSON.stringify(actual, null, 2))
    })

    it('should return undefined if a processing run exists (and no success)', async () => {
      const slots_date = dateFns.format(new Date(), 'yyyy-MM-dd')

      const { party_size, business, batch, check_time, check_dow } = await setup2({
        processing: true,
        slots_date,
      })

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id,
        party_size,
        check_dow,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        check_time,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time: '17:00',
            slots_end_time: '18:30',
          },
        ],
        useProxy: true,
      })

      expect(actual).to.eq(undefined)
    })

    it('should return the payload of a success run if it exists', async () => {
      const slots_date = dateFns.format(new Date(), 'yyyy-MM-dd')
      const { party_size, business, batch, check_time, check_dow, successRun } = await setup2({
        processing: true,
        success: true,
        slots_date,
      })

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id,
        party_size,
        check_dow,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        check_time,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time: '17:00',
            slots_end_time: '21:00',
          },
        ],
        useProxy: true,
      })

      expect(actual).to.deep.eq(successRun!.payload)
    })

    it.skip('should combine the existing done_incomplete payloads with the new one', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally
      const slots_date = dateFns.format(new Date(), 'yyyy-MM-dd')

      const { party_size, business, batch, check_time, check_dow } = await setup2({
        done_incomplete: true,
        slots_date,
      })

      const actual = await getAvailabilityAndParse({
        batch_id: batch.id,
        external_id: business.external_id,
        party_size,
        check_dow,
        cohort_id: batch.cohort_id,
        cohort_external_id: batch.cohort_external_id,
        check_time,
        humanReadableDate: true,
        slotTimeRanges: [
          {
            slots_date,
            slots_start_time: '17:00',
            slots_end_time: '20:00',
          },
        ],
        useProxy: true,
      })

      logger.debug(JSON.stringify(actual, null, 2))

      expect(actual!.data.length).to.eq(3) // 3 party sizes
      const partySize4 = find({ party_size: 4 }, actual!.data)

      expect(partySize4!.slots.length).to.eq(13) // 3 hours, 15 min intervals, so 13 slots total
    })
  })

  describe('parseResultsForSeated', () => {
    beforeEach(() => timekeeper.freeze(new Date()))
    afterEach(() => timekeeper.reset())

    it('should parse the opentable results for seated', async () => {
      const {
        business,
        slots_date,
        slots_start_time,
        slots_end_time,
        party_size,
        slotsObj,
        slotsObjWithSeating,
      } = await setup()
      if (!business) throw new Error()

      const actual = parseResultsForSeated({
        slotsObj,
        slotsObjWithSeating,
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
        business_id: 37,
        business_name: 'Basho Japanese Brasserie',
        interval: 15,
        time_of_check: now,
        site_checked: 'opentable',
        data: [
          {
            party_size: 2,
            slots: [
              { slot_date: 1626454800000, available: false, seating: [] },
              { slot_date: 1626455700000, available: false, seating: [] },
              { slot_date: 1626456600000, available: false, seating: [] },
              { slot_date: 1626457500000, available: false, seating: [] },
              { slot_date: 1626458400000, available: false, seating: [] },
              { slot_date: 1626459300000, available: false, seating: [] },
              { slot_date: 1626460200000, available: false, seating: [] },
              { slot_date: 1626461100000, available: false, seating: [] },
              { slot_date: 1626462000000, available: false, seating: [] },
              { slot_date: 1626462900000, available: false, seating: [] },
              { slot_date: 1626463800000, available: false, seating: [] },
              { slot_date: 1626464700000, available: false, seating: [] },
              { slot_date: 1626465600000, available: false, seating: [] },
              { slot_date: 1626466500000, available: false, seating: [] },
              { slot_date: 1626467400000, available: true, seating: [] },
              { slot_date: 1626468300000, available: true, seating: [] },
              { slot_date: 1626469200000, available: true, seating: [] },
              { slot_date: 1626470100000, available: true, seating: [] },
              { slot_date: 1626471000000, available: true, seating: [] },
              { slot_date: 1626471900000, available: true, seating: [] },
              { slot_date: 1626472800000, available: true, seating: [] },
              { slot_date: 1626473700000, available: true, seating: [] },
              { slot_date: 1626474600000, available: true, seating: [] },
              { slot_date: 1626475500000, available: true, seating: [] },
              { slot_date: 1626476400000, available: true, seating: [] },
              { slot_date: 1626477300000, available: true, seating: [] },
              { slot_date: 1626478200000, available: true, seating: [] },
              { slot_date: 1626479100000, available: true, seating: [] },
              { slot_date: 1626480000000, available: true, seating: [] },
              { slot_date: 1626480900000, available: true, seating: [] },
              { slot_date: 1626481800000, available: true, seating: [] },
              { slot_date: 1626482700000, available: true, seating: [] },
              { slot_date: 1626483600000, available: true, seating: [] },
            ],
          },
        ],
      }

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('slotAvailability', () => {
    it('should return all slot availabilities in seated format', async () => {
      const {
        business,
        slots_date,
        slots_end_time,
        slots_start_time,
        slotsObj,
        slotsObjWithSeating,
      } = await setup()
      const actual = slotAvailability({
        slotsObj,
        slotsObjWithSeating,
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
        { slot_date: 1626454800000, available: false, seating: [] },
        { slot_date: 1626455700000, available: false, seating: [] },
        { slot_date: 1626456600000, available: false, seating: [] },
        { slot_date: 1626457500000, available: false, seating: [] },
        { slot_date: 1626458400000, available: false, seating: [] },
        { slot_date: 1626459300000, available: false, seating: [] },
        { slot_date: 1626460200000, available: false, seating: [] },
        { slot_date: 1626461100000, available: false, seating: [] },
        { slot_date: 1626462000000, available: false, seating: [] },
        { slot_date: 1626462900000, available: false, seating: [] },
        { slot_date: 1626463800000, available: false, seating: [] },
        { slot_date: 1626464700000, available: false, seating: [] },
        { slot_date: 1626465600000, available: false, seating: [] },
        { slot_date: 1626466500000, available: false, seating: [] },
        { slot_date: 1626467400000, available: true, seating: [] },
        { slot_date: 1626468300000, available: true, seating: [] },
        { slot_date: 1626469200000, available: true, seating: [] },
        { slot_date: 1626470100000, available: true, seating: [] },
        { slot_date: 1626471000000, available: true, seating: [] },
        { slot_date: 1626471900000, available: true, seating: [] },
        { slot_date: 1626472800000, available: true, seating: [] },
        { slot_date: 1626473700000, available: true, seating: [] },
        { slot_date: 1626474600000, available: true, seating: [] },
        { slot_date: 1626475500000, available: true, seating: [] },
        { slot_date: 1626476400000, available: true, seating: [] },
        { slot_date: 1626477300000, available: true, seating: [] },
        { slot_date: 1626478200000, available: true, seating: [] },
        { slot_date: 1626479100000, available: true, seating: [] },
        { slot_date: 1626480000000, available: true, seating: [] },
        { slot_date: 1626480900000, available: true, seating: [] },
        { slot_date: 1626481800000, available: true, seating: [] },
        { slot_date: 1626482700000, available: true, seating: [] },
        { slot_date: 1626483600000, available: true, seating: [] },
      ]

      expect(actual).to.deep.eq(expected)
      expect(actual.length).to.eq(33) // 15 min intervals between 13:00 and 21:00 inclusive
    })

    it('should return slots in intersection of slotsObj and slotTimeRanges', async () => {
      const { business } = await setup()
      const slots_date = '2021-11-16'
      const { slotTimeRanges } = setupSlotTimeRanges({ slots_date, business })

      const actual = slotAvailability({
        slotsObj: SLOTS_OBJ,
        slotsObjWithSeating: SLOTS_OBJ_WITH_SEATING,
        business,
        humanReadableDate: true,
        slotTimeRanges,
      })

      // This excludes any times that are not in the intersection of slotsObj and slotTimeRanges.
      // For example:
      //   slotsObj contains times for 2021-11-18, as well as times after 21:00
      //   slotTimeRanges contains times for 2021-11-17 from 12:00 to 17:00
      // None of those are included in the final result.
      const expected = [
        {
          slot_date: 1637100000000,
          available: true,
          humanReadableDate: '2021-11-16T17:00',
          seating: ['default'],
        },
        {
          slot_date: 1637100900000,
          available: true,
          humanReadableDate: '2021-11-16T17:15',
          seating: ['default'],
        },
        {
          slot_date: 1637101800000,
          available: true,
          humanReadableDate: '2021-11-16T17:30',
          seating: ['default'],
        },
        {
          slot_date: 1637102700000,
          available: true,
          humanReadableDate: '2021-11-16T17:45',
          seating: ['default'],
        },
        {
          slot_date: 1637103600000,
          available: true,
          humanReadableDate: '2021-11-16T18:00',
          seating: ['default'],
        },
        {
          slot_date: 1637104500000,
          available: true,
          humanReadableDate: '2021-11-16T18:15',
          seating: ['default'],
        },
        {
          slot_date: 1637105400000,
          available: true,
          humanReadableDate: '2021-11-16T18:30',
          seating: ['default'],
        },
        {
          slot_date: 1637106300000,
          available: true,
          humanReadableDate: '2021-11-16T18:45',
          seating: ['default'],
        },
        {
          slot_date: 1637107200000,
          available: false,
          humanReadableDate: '2021-11-16T19:00',
          seating: [],
        },
        {
          slot_date: 1637108100000,
          available: false,
          humanReadableDate: '2021-11-16T19:15',
          seating: [],
        },
        {
          slot_date: 1637109000000,
          available: false,
          humanReadableDate: '2021-11-16T19:30',
          seating: [],
        },
        {
          slot_date: 1637109900000,
          available: false,
          humanReadableDate: '2021-11-16T19:45',
          seating: [],
        },
        {
          slot_date: 1637110800000,
          available: true,
          humanReadableDate: '2021-11-16T20:00',
          seating: ['default'],
        },
        {
          slot_date: 1637111700000,
          available: true,
          humanReadableDate: '2021-11-16T20:15',
          seating: ['default'],
        },
        {
          slot_date: 1637112600000,
          available: true,
          humanReadableDate: '2021-11-16T20:30',
          seating: ['default'],
        },
        {
          slot_date: 1637113500000,
          available: true,
          humanReadableDate: '2021-11-16T20:45',
          seating: ['default'],
        },
        {
          slot_date: 1637114400000,
          available: true,
          humanReadableDate: '2021-11-16T21:00',
          seating: ['default'],
        },
        {
          slot_date: 1637186400000,
          available: true,
          humanReadableDate: '2021-11-17T17:00',
          seating: ['default'],
        },
        {
          slot_date: 1637187300000,
          available: true,
          humanReadableDate: '2021-11-17T17:15',
          seating: ['default'],
        },
        {
          slot_date: 1637188200000,
          available: true,
          humanReadableDate: '2021-11-17T17:30',
          seating: ['default'],
        },
        {
          slot_date: 1637189100000,
          available: true,
          humanReadableDate: '2021-11-17T17:45',
          seating: ['default'],
        },
        {
          slot_date: 1637190000000,
          available: true,
          humanReadableDate: '2021-11-17T18:00',
          seating: ['default'],
        },
        {
          slot_date: 1637190900000,
          available: true,
          humanReadableDate: '2021-11-17T18:15',
          seating: ['default'],
        },
        {
          slot_date: 1637191800000,
          available: true,
          humanReadableDate: '2021-11-17T18:30',
          seating: ['default'],
        },
        {
          slot_date: 1637192700000,
          available: true,
          humanReadableDate: '2021-11-17T18:45',
          seating: ['default'],
        },
        {
          slot_date: 1637193600000,
          available: false,
          humanReadableDate: '2021-11-17T19:00',
          seating: [],
        },
        {
          slot_date: 1637194500000,
          available: false,
          humanReadableDate: '2021-11-17T19:15',
          seating: [],
        },
        {
          slot_date: 1637195400000,
          available: false,
          humanReadableDate: '2021-11-17T19:30',
          seating: [],
        },
        {
          slot_date: 1637196300000,
          available: false,
          humanReadableDate: '2021-11-17T19:45',
          seating: [],
        },
        {
          slot_date: 1637197200000,
          available: true,
          humanReadableDate: '2021-11-17T20:00',
          seating: ['default'],
        },
        {
          slot_date: 1637198100000,
          available: true,
          humanReadableDate: '2021-11-17T20:15',
          seating: ['default'],
        },
        {
          slot_date: 1637199000000,
          available: true,
          humanReadableDate: '2021-11-17T20:30',
          seating: ['default'],
        },
        {
          slot_date: 1637199900000,
          available: true,
          humanReadableDate: '2021-11-17T20:45',
          seating: ['default'],
        },
        {
          slot_date: 1637200800000,
          available: true,
          humanReadableDate: '2021-11-17T21:00',
          seating: ['default'],
        },
      ]

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('markUnavailable', () => {
    it('should mark slots unavailable', async () => {
      const { business } = await setup()

      const slotTimes = allSlotTimes({
        slotTimeRanges: [
          {
            slots_date: '2021-07-27',
            slots_start_time: '17:00',
            slots_end_time: '22:00',
          },
        ],
        interval: 15,
        tz: 'America/New_York',
      })

      const slotsObj: ISlotsObj = reduce(
        (acc, t: Date) => ({ ...acc, [otFormat({ dateTime: t, business })]: null }),
        {},
        slotTimes
      )

      markUnavailable({
        dateTime: dateFnsTz.zonedTimeToUtc('2021-07-27T22:00', 'America/New_York'),
        business,
        slotsObj,
      })

      const expected = {
        '2021-07-27T17:00': null,
        '2021-07-27T17:15': null,
        '2021-07-27T17:30': null,
        '2021-07-27T17:45': null,
        '2021-07-27T18:00': null,
        '2021-07-27T18:15': null,
        '2021-07-27T18:30': null,
        '2021-07-27T18:45': null,
        '2021-07-27T19:00': null,
        '2021-07-27T19:15': null,
        '2021-07-27T19:30': false,
        '2021-07-27T19:45': false,
        '2021-07-27T20:00': false,
        '2021-07-27T20:15': false,
        '2021-07-27T20:30': false,
        '2021-07-27T20:45': false,
        '2021-07-27T21:00': false,
        '2021-07-27T21:15': false,
        '2021-07-27T21:30': false,
        '2021-07-27T21:45': false,
        '2021-07-27T22:00': false,
        '2021-07-27T22:15': false,
        '2021-07-27T22:30': false, // Note that we mark stuff OUTSIDE of the range as false. This is intended
        '2021-07-27T22:45': false,
        '2021-07-27T23:00': false,
        '2021-07-27T23:15': false,
        '2021-07-27T23:30': false,
        '2021-07-27T23:45': false,
        '2021-07-28T00:00': false,
        '2021-07-28T00:15': false,
        '2021-07-28T00:30': false,
      }

      expect(slotsObj).to.deep.eq(expected)
    })
  })

  describe('markAllUnavailable', () => {
    it('should mark all slots unavailable', async () => {
      const { business } = await setup()

      const slotTimes = allSlotTimes({
        slotTimeRanges: [
          {
            slots_date: '2021-07-27',
            slots_start_time: '17:00',
            slots_end_time: '22:00',
          },
        ],
        interval: 15,
        tz: 'America/New_York',
      })

      const slotsObj: ISlotsObj = reduce(
        (acc, t: Date) => ({ ...acc, [otFormat({ dateTime: t, business })]: null }),
        {},
        slotTimes
      )

      markAllUnavailable({
        business,
        slotTimes,
        slotsObj,
      })

      const expected = {
        '2021-07-27T17:00': false,
        '2021-07-27T17:15': false,
        '2021-07-27T17:30': false,
        '2021-07-27T17:45': false,
        '2021-07-27T18:00': false,
        '2021-07-27T18:15': false,
        '2021-07-27T18:30': false,
        '2021-07-27T18:45': false,
        '2021-07-27T19:00': false,
        '2021-07-27T19:15': false,
        '2021-07-27T19:30': false,
        '2021-07-27T19:45': false,
        '2021-07-27T20:00': false,
        '2021-07-27T20:15': false,
        '2021-07-27T20:30': false,
        '2021-07-27T20:45': false,
        '2021-07-27T21:00': false,
        '2021-07-27T21:15': false,
        '2021-07-27T21:30': false,
        '2021-07-27T21:45': false,
        '2021-07-27T22:00': false,
      }
      expect(slotsObj).to.deep.eq(expected)
    })
  })

  describe('aboveMaxPartySize', () => {
    it('should return true if party size is above max for that restaurant', async () => {
      const actual = aboveMaxPartySize({
        data: DATA_ABOVE_MAX_PARTY_SIZE as any,
        dateString: '2021-11-19',
      })
      expect(actual).to.eq(true)
    })
  })

  describe('noAvailability', () => {
    it('should return true if no availability', async () => {
      expect(
        Boolean(
          !(DATA_NO_SLOTS as any).availability &&
            includes(
              'no online availability within 2.5 hours',
              DATA_NO_SLOTS.sameDayAvailability.noTimesMessage
            )
        )
      ).to.eq(true)

      const actual = noAvailability({
        data: DATA_NO_SLOTS as any,
        dateString: '2021-07-26',
      })
      expect(actual).to.eq(true)
    })
  })

  describe('noAvailability - not active', () => {
    it('should return true if no availability if the restaurant is not active', async () => {
      const actual = noAvailability({
        data: DATA_NOT_ACTIVE as any,
        dateString: '2021-07-25',
      })
      expect(actual).to.eq(true)
    })
  })

  describe('noService', () => {
    it('should return true if restaurant is not servicable.', async () => {
      const actual = noService(DATA_NO_SERVICE as any)
      expect(actual).to.eq(true)
    })
  })
})
