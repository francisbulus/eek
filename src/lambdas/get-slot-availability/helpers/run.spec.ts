import { expect } from 'chai'
import { each, filter, map } from 'lodash/fp'
import timekeeper from 'timekeeper'

import { prisma } from '../config/prisma'
import { seedAll as seed } from '../prisma/seedHelpers'
import * as PAYLOAD from '../test/fixtures/helpers/seated-payload.json'
import { epochMs, formatInTimeZone } from './date'
import type { TSeatedSlotAvailabilityObject } from './run'
import {
  addToSlotAvailabilityObject,
  combineRunPayloads,
  createRun,
  flattenSlotAvailabilityObject,
  // getExistingRunAndPayloadOrCreate,
  getExistingRuns,
  getMissingSlots,
  getRelevantExistingRuns,
  mergePayloads,
  payloadFromExisting,
  slotsForPartySize,
} from './run'
import type { TSeatedPayloadDatum } from './seated'

const setupCombinedPayloadRuns = () => {
  const payload1 = { ...PAYLOAD }
  const payload2 = { ...PAYLOAD }
  const payload3 = { ...PAYLOAD }

  payload2.time_of_check = 16369576011234
  payload2.data = [
    {
      // These slots don't exist in payload1 because payload1 has no party_size of 2
      party_size: 2,
      slots: [
        {
          available: false,
          humanReadableDate: '2021-07-25T18:00:00.000Z',
          slot_date: 1627250400000,
        },
        {
          available: true,
          humanReadableDate: '2021-07-25T22:30:00.000Z',
          slot_date: 1627266600000,
        },
      ],
    },
  ]

  payload3.time_of_check = 16369576019999
  payload3.data = [
    {
      party_size: 6,
      slots: [
        {
          available: false, // This should override payload1
          humanReadableDate: '2021-07-25T17:00:00.000Z',
          slot_date: 1627246800000,
        },
        {
          available: false, // This should override payload1
          humanReadableDate: '2021-07-25T17:30:00.000Z',
          slot_date: 1627248600000,
        },
        {
          available: false,
          humanReadableDate: '2021-07-25T18:00:00.000Z',
          slot_date: 1627250400000,
        },
        {
          available: true,
          humanReadableDate: '2021-07-25T22:30:00.000Z',
          slot_date: 1627266600000,
        },
      ],
    },
  ]

  // Will use the created_at date to sort, so fresher data overrides older data
  // no matter the order in the array
  const runs = [
    { scrape_status: 'done_incomplete', created_at: new Date('2021-07-03'), payload: payload3 },
    { scrape_status: 'done_incomplete', created_at: new Date('2021-07-01'), payload: payload1 },
    { scrape_status: 'done_incomplete', created_at: new Date('2021-07-02'), payload: payload2 },
  ]
  const expected = {
    business_id: 37,
    business_name: 'Basho Japanese Brasserie',
    interval: 15,
    site_checked: 'opentable',
    time_of_check: 16369576019999, // The latest time of all the payloads
    data: [
      {
        party_size: 2,
        slots: [
          { slot_date: 1627250400000, available: false },
          { slot_date: 1627266600000, available: true },
        ],
      },
      {
        party_size: 4,
        slots: [
          { slot_date: 1627246800000, available: true },
          { slot_date: 1627248600000, available: false },
          { slot_date: 1627250400000, available: true },
          { slot_date: 1627264800000, available: false },
          { slot_date: 1627266600000, available: true },
        ],
      },
      {
        party_size: 6,
        slots: [
          { slot_date: 1627246800000, available: false },
          { slot_date: 1627248600000, available: false },
          { slot_date: 1627250400000, available: false },
          { slot_date: 1627266600000, available: true },
        ],
      },
    ],
  }

  return { runs, expected }
}

const setupExistingRuns = async () => {
  const batch = await prisma.batch.create({
    data: {
      check_dow: 'monday',
      check_time: '08:00',
      cohort_external_id: 4,
      expected_num_slots: 1234,
      cohort_id: 4,
      num_businesses: 12,
      slots_per_run: 5,
      num_party_sizes: 3,
    },
  })

  const batch2 = await prisma.batch.create({
    data: {
      check_dow: 'monday',
      check_time: '08:00',
      cohort_external_id: 5,
      expected_num_slots: 4321,
      cohort_id: 5,
      num_businesses: 12,
      slots_per_run: 5,
      num_party_sizes: 3,
    },
  })

  const business = await prisma.business.findFirst({})

  const common: any = {
    batch_id: batch!.id,
    business_id: business!.id,
    cohort_id: 4,
    cohort_external_id: 4,
    check_dow: 'monday',
    check_time: '08:00',
    party_size: 4,
    test_mode: false,
    deleted_at: null,
  }

  await prisma.run.createMany({
    data: [
      {
        ...common,
        scrape_status: 'processing',
      },
      {
        ...common,
        scrape_status: 'success',
      },
      {
        ...common,
        scrape_status: 'done_incomplete',
      },
      {
        ...common,
        scrape_status: 'pending', // This will be excluded because we don't care about pending
      },
      {
        ...common,
        scrape_status: 'done_incomplete',
      },
      {
        ...common,
        scrape_status: 'processing',
        created_at: new Date('2020-01-01'), // This will be excluded because it's more than 15 min old
      },
      {
        ...common,
        batch_id: batch2.id, // This will be excluded because it's the wrong batch id
        scrape_status: 'success',
      },
    ],
  })

  return { batch, batch2, business, common }
}

describe('run helpers', () => {
  describe('addToSlotAvailabilityObject', () => {
    it('should add slots to availability object', async () => {
      const obj: TSeatedSlotAvailabilityObject = {}
      each(addToSlotAvailabilityObject(obj), PAYLOAD.data)
      const expected: TSeatedSlotAvailabilityObject = {
        4: {
          1627246800000: true, // true, not false, because later entry overrides earlier
          1627248600000: false,
          1627250400000: true,
          1627264800000: false,
          1627266600000: true,
        },
        6: { 1627246800000: true, 1627248600000: true, 1627250400000: false },
      }

      expect(obj).to.deep.eq(expected)
    })
  })

  describe('combineRunPayloads', () => {
    it('should return undefined if no runs have payloads', async () => {
      const runs = [{ payload: undefined }, { payload: {} }, { payload: [] }]
      const actual = combineRunPayloads(runs as any[])
      expect(actual).to.eq(undefined)
    })

    it('should throw an error if trying to combine payloads from different bizs', async () => {
      const payload1 = { ...PAYLOAD }
      const payload2 = { ...PAYLOAD }
      payload2.business_name = 'Cool business, bro'

      const runs = [{ payload: payload1 }, { payload: payload2 }]

      try {
        combineRunPayloads(runs as any)
        throw new Error(`Didn't throw`)
      } catch (err: any) {
        expect(err.message).to.eq(
          'Warn: Trying to combine payloads from runs of different businesses'
        )
      }
    })

    it('should combine all payloads', async () => {
      const { runs, expected } = setupCombinedPayloadRuns()

      const actual = combineRunPayloads(runs as any)

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('createRun', () => {
    before(() => seed())
    afterEach(() => timekeeper.reset())

    it('should create the run, with the correct values', async () => {
      const now = new Date()
      timekeeper.freeze(now)
      const { common, business } = await setupExistingRuns()

      const {
        batch_id,
        cohort_id,
        cohort_external_id,
        check_dow,
        check_time,
        party_size,
        test_mode,
      } = common

      const slotTimeRanges = [
        {
          slots_date: '2021-07-25',
          slots_start_time: '17:00',
          slots_end_time: '19:00',
        },
      ]

      const actual = await createRun({
        slotTimeRanges,
        batch_id,
        business: business as any,
        cohort_id,
        cohort_external_id,
        check_dow,
        check_time,
        party_size,
        test_mode,
      })

      expect(actual.business_id).to.eq(business!.id)
      expect(actual.check_dow).to.eq(check_dow)
      expect(actual.check_time).to.eq(check_time)
      expect(actual.party_size).to.eq(party_size)

      expect(actual.started_at!.toISOString()).to.eq(now.toISOString())
      expect(actual.scrape_status).to.eq('processing')
      expect(actual.upload_status).to.eq('pending')

      expect(actual.expected_num_slots).to.eq(9) // 2 hours, 15 min intervals, so 9 total
    })
  })

  describe('flattenSlotAvailabilityObject', () => {
    it('should flatten the object into format seated expected', async () => {
      const obj: TSeatedSlotAvailabilityObject = {
        4: {
          1627246800000: true,
          1627248600000: false,
          1627250400000: true,
          1627264800000: false,
          1627266600000: true,
        },
        6: { 1627246800000: true, 1627248600000: true, 1627250400000: false },
      }

      const actual = flattenSlotAvailabilityObject(obj)

      const expected: TSeatedPayloadDatum[] = [
        {
          party_size: 4,
          slots: [
            { slot_date: 1627246800000, available: true },
            { slot_date: 1627248600000, available: false },
            { slot_date: 1627250400000, available: true },
            { slot_date: 1627264800000, available: false },
            { slot_date: 1627266600000, available: true },
          ],
        },
        {
          party_size: 6,
          slots: [
            { slot_date: 1627246800000, available: true },
            { slot_date: 1627248600000, available: true },
            { slot_date: 1627250400000, available: false },
          ],
        },
      ]

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('existing runs', () => {
    before(async () => {
      await seed()
    })

    describe('getExistingRuns', () => {
      it('should return all existing runs', async () => {
        const { common, business } = await setupExistingRuns()
        const actual = await getExistingRuns({ ...common, business })

        const pending = filter({ scrape_status: 'pending' }, actual)
        const processing = filter({ scrape_status: 'processing' }, actual)
        const success = filter({ scrape_status: 'success' }, actual)
        const done_incomplete = filter({ scrape_status: 'done_incomplete' }, actual)

        expect(pending.length).to.eq(0)
        expect(processing.length).to.eq(1)
        expect(success.length).to.eq(1)
        expect(done_incomplete.length).to.eq(2)
        expect(actual.length).to.eq(4)
      })
    })

    describe('getRelevantExistingRuns', () => {
      it('should return success first if it exists', async () => {
        const { common, business } = await setupExistingRuns()
        const runs = await getExistingRuns({ ...common, business })
        const actual = getRelevantExistingRuns(runs)

        expect(actual.length).to.eq(1)
        expect(actual[0].scrape_status).to.eq('success')
      })

      it('should return processing if it exists, and no success', async () => {
        const { common, business } = await setupExistingRuns()
        await prisma.run.deleteMany({ where: { scrape_status: 'success' } })
        const runs = await getExistingRuns({ ...common, business })

        const actual = getRelevantExistingRuns(runs)

        expect(actual.length).to.eq(1)
        expect(actual[0].scrape_status).to.eq('processing')
      })

      it('should return multiple done_incomplete if no success nor processing', async () => {
        const { common, business } = await setupExistingRuns()
        await prisma.run.deleteMany({ where: { scrape_status: 'success' } })
        await prisma.run.deleteMany({ where: { scrape_status: 'processing' } })
        const runs = await getExistingRuns({ ...common, business })

        const actual = getRelevantExistingRuns(runs)

        expect(actual.length).to.eq(2)
        expect(actual[0].scrape_status).to.eq('done_incomplete')
        expect(actual[1].scrape_status).to.eq('done_incomplete')
      })
    })
  })

  describe('// getExistingRunAndPayloadOrCreate', () => {
    xit('should ', async () => {
      expect(true).to.eq(false)
    })
  })

  describe('getMissingSlots', () => {
    const setup = async () => {
      const slotTimeRanges = [
        {
          slots_date: '2021-07-25',
          slots_start_time: '17:00',
          slots_end_time: '19:00',
        },
        {
          slots_date: '2021-07-25',
          slots_start_time: '21:00',
          slots_end_time: '23:00',
        },
        {
          slots_date: '2021-07-26',
          slots_start_time: '08:00',
          slots_end_time: '10:00',
        },
      ]

      const business = {
        slot_interval: 30,
        timezone: 'America/New_York',
      }

      const payload = { ...PAYLOAD }
      const party_size = 4

      return { slotTimeRanges, business, payload, party_size }
    }

    it('should return array of dates of missing slots', async () => {
      const { slotTimeRanges, business, payload, party_size } = await setup()

      const actual = map(
        (d: Date) => formatInTimeZone({ date: d, tz: business.timezone }),
        getMissingSlots({
          slotTimeRanges,
          business: business as any,
          payload,
          party_size,
        })
      )

      const expected = [
        '2021-07-25T18:30:00.000Z',
        '2021-07-25T19:00:00.000Z',
        '2021-07-25T21:00:00.000Z',
        '2021-07-25T21:30:00.000Z',
        '2021-07-25T23:00:00.000Z',
        '2021-07-26T08:00:00.000Z',
        '2021-07-26T08:30:00.000Z',
        '2021-07-26T09:00:00.000Z',
        '2021-07-26T09:30:00.000Z',
        '2021-07-26T10:00:00.000Z',
      ]

      expect(actual).to.deep.eq(expected)
    })

    it('should return all slots if payload is empty', async () => {
      const { slotTimeRanges, business, party_size } = await setup()

      const actual = map(
        (d: Date) => formatInTimeZone({ date: d, tz: business.timezone }),
        getMissingSlots({
          slotTimeRanges,
          business: business as any,
          payload: undefined,
          party_size,
        })
      )

      const expected = [
        '2021-07-25T17:00:00.000Z',
        '2021-07-25T17:30:00.000Z',
        '2021-07-25T18:00:00.000Z',
        '2021-07-25T18:30:00.000Z',
        '2021-07-25T19:00:00.000Z',
        '2021-07-25T21:00:00.000Z',
        '2021-07-25T21:30:00.000Z',
        '2021-07-25T22:00:00.000Z',
        '2021-07-25T22:30:00.000Z',
        '2021-07-25T23:00:00.000Z',
        '2021-07-26T08:00:00.000Z',
        '2021-07-26T08:30:00.000Z',
        '2021-07-26T09:00:00.000Z',
        '2021-07-26T09:30:00.000Z',
        '2021-07-26T10:00:00.000Z',
      ]

      expect(actual).to.deep.eq(expected)
    })

    it('should return an empty array if payload fully covers expected', async () => {
      const { slotTimeRanges, business, payload, party_size } = await setup()

      payload.data = [
        ...payload.data,
        {
          party_size,
          slots: [
            {
              slot_date: epochMs('2021-07-25T22:30:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-25T23:00:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-26T01:00:00.000Z'),
              available: false,
            },
            {
              slot_date: epochMs('2021-07-26T01:30:00.000Z'),
              available: false,
            },
            {
              slot_date: epochMs('2021-07-26T03:00:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-26T12:00:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-26T12:30:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-26T13:00:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-26T13:30:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-07-26T14:00:00.000Z'),
              available: true,
            },
          ],
        },
        {
          // These slots don't exist at all in the slotTimeRanges
          party_size,
          slots: [
            {
              slot_date: epochMs('2021-10-25T22:30:00.000Z'),
              available: true,
            },
            {
              slot_date: epochMs('2021-10-25T23:00:00.000Z'),
              available: true,
            },
          ],
        },
      ] as any

      const actual = getMissingSlots({
        slotTimeRanges,
        business: business as any,
        payload,
        party_size,
      })

      expect(actual).to.deep.eq([])
    })
  })

  describe('slotsForPartySize', () => {
    it('should retrieve the slots for the given party size (combining multiple arrays)', async () => {
      const actual = slotsForPartySize({ party_size: 4, payload: PAYLOAD })
      const expected = [
        {
          available: true, // The later value of true overrides the prev value of false
          humanReadableDate: '2021-07-25T17:00',
          slot_date: 1627246800000,
        },
        {
          available: false,
          humanReadableDate: '2021-07-25T17:30',
          slot_date: 1627248600000,
        },
        {
          available: true,
          humanReadableDate: '2021-07-25T18:00',
          slot_date: 1627250400000,
        },
        {
          available: false,
          humanReadableDate: '2021-07-25T22:00',
          slot_date: 1627264800000,
        },
        {
          available: true,
          humanReadableDate: '2021-07-25T22:30',
          slot_date: 1627266600000,
        },
      ]

      expect(actual).to.deep.eq(expected)
    })

    it('should retrieve the slots for the given party size', async () => {
      const actual = slotsForPartySize({ party_size: 6, payload: PAYLOAD })
      const expected = [
        {
          available: true,
          humanReadableDate: '2021-07-25T17:00',
          slot_date: 1627246800000,
        },
        {
          available: true,
          humanReadableDate: '2021-07-25T17:30',
          slot_date: 1627248600000,
        },
        {
          available: false,
          humanReadableDate: '2021-07-25T18:00',
          slot_date: 1627250400000,
        },
      ]

      expect(actual).to.deep.eq(expected)
    })
    it('should return empty array if no slots for party size', async () => {
      const actual = slotsForPartySize({ party_size: 7, payload: PAYLOAD })
      const expected: any[] = []

      expect(actual).to.deep.eq(expected)
    })
  })

  describe('mergePayloads', () => {
    it('should merge two payloads', async () => {
      const payload1 = { ...PAYLOAD }
      const payload2 = { ...PAYLOAD }

      payload2.time_of_check = 16369576011234
      payload2.data = [
        {
          // These slots don't exist in payload1 because payload1 has no party_size of 2
          party_size: 2,
          slots: [
            {
              available: false,
              humanReadableDate: '2021-07-25T18:00:00.000Z',
              slot_date: 1627250400000,
            },
            {
              available: true,
              humanReadableDate: '2021-07-25T22:30:00.000Z',
              slot_date: 1627266600000,
            },
          ],
        },
        {
          party_size: 6,
          slots: [
            {
              available: false, // This should override payload1
              humanReadableDate: '2021-07-25T17:00:00.000Z',
              slot_date: 1627246800000,
            },
            {
              available: false, // This should override payload1
              humanReadableDate: '2021-07-25T17:30:00.000Z',
              slot_date: 1627248600000,
            },
            {
              available: false,
              humanReadableDate: '2021-07-25T18:00:00.000Z',
              slot_date: 1627250400000,
            },
            {
              available: true,
              humanReadableDate: '2021-07-25T22:30:00.000Z',
              slot_date: 1627266600000,
            },
          ],
        },
      ]

      const actual = mergePayloads(payload1, payload2)

      const expected = {
        business_id: 37,
        business_name: 'Basho Japanese Brasserie',
        interval: 15,
        site_checked: 'opentable',
        time_of_check: payload2.time_of_check, // should take the newer time of check
        data: [
          {
            party_size: 2,
            slots: [
              { slot_date: 1627250400000, available: false },
              { slot_date: 1627266600000, available: true },
            ],
          },
          {
            party_size: 4,
            slots: [
              { slot_date: 1627246800000, available: true },
              { slot_date: 1627248600000, available: false },
              { slot_date: 1627250400000, available: true },
              { slot_date: 1627264800000, available: false },
              { slot_date: 1627266600000, available: true },
            ],
          },
          {
            party_size: 6,
            slots: [
              { slot_date: 1627246800000, available: false },
              { slot_date: 1627248600000, available: false },
              { slot_date: 1627250400000, available: false },
              { slot_date: 1627266600000, available: true },
            ],
          },
        ],
      }

      expect(actual).to.deep.eq(expected)
    })

    it('should return payload1 if payload2 is empty, and vice versa', async () => {
      const payload1 = { ...PAYLOAD }
      const payload2 = {}
      const actual = mergePayloads(payload1, payload2 as any)

      expect(actual).to.deep.eq(payload1)

      const actual2 = mergePayloads(payload2 as any, payload1)

      expect(actual2).to.deep.eq(payload1)
    })

    it('should throw if different restaurants', async () => {
      const payload1 = { ...PAYLOAD }
      const payload2 = { ...PAYLOAD }
      payload2.business_name = 'Cool business, bro'

      try {
        mergePayloads(payload1, payload2)
        throw new Error(`Didn't throw`)
      } catch (err: any) {
        expect(err.message).to.eq(
          'Warn: Trying to combine payloads from runs of different businesses'
        )
      }
    })
  })

  describe('payloadFromExisting', () => {
    it('should return undefined if no runs', async () => {
      const actual = payloadFromExisting({ runs: undefined, platform: 'opentable' })
      expect(actual).to.eq(undefined)
    })

    it('should return the full payload if one success', async () => {
      const runs = [
        {
          scrape_status: 'success',
          payload: PAYLOAD,
        },
      ]

      const actual = payloadFromExisting({ runs: runs as any, platform: 'opentable' })

      expect(actual).to.deep.eq(PAYLOAD)
    })

    it('should return undefined if one processing', async () => {
      const runs = [
        {
          scrape_status: 'processing',
          payload: PAYLOAD,
        },
      ]

      const actual = payloadFromExisting({ runs: runs as any, platform: 'opentable' })

      expect(actual).to.eq(undefined)
    })

    it('should return the combined payload if one or more done_incomplete', async () => {
      const { expected, runs } = setupCombinedPayloadRuns()

      const actual = payloadFromExisting({ runs: runs as any, platform: 'opentable' })

      expect(actual).to.deep.eq(expected)
    })

    it('should return undefined if some other status', async () => {
      const runs = [
        {
          scrape_status: 'pending',
          payload: PAYLOAD,
        },
      ]

      const actual = payloadFromExisting({ runs: runs as any, platform: 'opentable' })

      expect(actual).to.eq(undefined)
    })
  })
})
