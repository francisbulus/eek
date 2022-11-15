import { expect } from 'chai'
import * as dateFnsTz from 'date-fns-tz'
import { map } from 'lodash/fp'

import { formatInTimeZone } from './date'
import { allSlotTimes, getSlotTimes, slotTimesToRanges } from './slot'

describe('slot helpers', () => {
  describe('allSlotTimes', () => {
    it('should create slot times for multiple slot ranges, sorted', async () => {
      const tz = 'America/Los_Angeles'
      const interval = 30
      const slotTimeRanges = [
        {
          slots_date: '2021-07-28',
          slots_start_time: '10:00',
          slots_end_time: '15:00',
        },
        {
          slots_date: '2021-07-29',
          slots_start_time: '10:00',
          slots_end_time: '15:00',
        },
        {
          slots_date: '2021-07-27',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
      ]

      const actual = allSlotTimes({
        slotTimeRanges,
        tz,
        interval,
      })

      const actualStrings = map(
        (d) => formatInTimeZone({ date: d, tz, fmt: 'yyyy-MM-dd HH:mm:ss' }),
        actual
      )

      const expectedStrings = [
        '2021-07-27 12:00:00',
        '2021-07-27 12:30:00',
        '2021-07-27 13:00:00',
        '2021-07-27 13:30:00',
        '2021-07-27 14:00:00',
        '2021-07-28 10:00:00',
        '2021-07-28 10:30:00',
        '2021-07-28 11:00:00',
        '2021-07-28 11:30:00',
        '2021-07-28 12:00:00',
        '2021-07-28 12:30:00',
        '2021-07-28 13:00:00',
        '2021-07-28 13:30:00',
        '2021-07-28 14:00:00',
        '2021-07-28 14:30:00',
        '2021-07-28 15:00:00',
        '2021-07-29 10:00:00',
        '2021-07-29 10:30:00',
        '2021-07-29 11:00:00',
        '2021-07-29 11:30:00',
        '2021-07-29 12:00:00',
        '2021-07-29 12:30:00',
        '2021-07-29 13:00:00',
        '2021-07-29 13:30:00',
        '2021-07-29 14:00:00',
        '2021-07-29 14:30:00',
        '2021-07-29 15:00:00',
      ]

      expect(actualStrings).to.deep.eq(expectedStrings)
    })
  })

  describe('slotTimesToRanges', () => {
    it('should create minimal set of slot time ranges, given an array of dates', async () => {
      const slotTimeRanges = [
        {
          slots_date: '2021-07-28',
          slots_start_time: '10:00',
          slots_end_time: '15:00',
        },
        {
          slots_date: '2021-07-29',
          slots_start_time: '10:00',
          slots_end_time: '15:00',
        },
        {
          slots_date: '2021-07-27',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
      ]

      const slotTimeOverrides = [
        // These are not in the range, so they'll be excluded completely
        dateFnsTz.zonedTimeToUtc(`2021-07-27 11:30`, 'America/Los_Angeles'),
        dateFnsTz.zonedTimeToUtc(`2021-07-27 10:00`, 'America/Los_Angeles'),

        dateFnsTz.zonedTimeToUtc(`2021-07-27 12:30`, 'America/Los_Angeles'),

        // This is not in range, so it will be excluded
        dateFnsTz.zonedTimeToUtc(`2021-07-27 14:30`, 'America/Los_Angeles'),

        dateFnsTz.zonedTimeToUtc(`2021-07-28 11:00`, 'America/Los_Angeles'),
        dateFnsTz.zonedTimeToUtc(`2021-07-28 12:00`, 'America/Los_Angeles'),
        dateFnsTz.zonedTimeToUtc(`2021-07-28 13:00`, 'America/Los_Angeles'),

        // One date can make a range
        dateFnsTz.zonedTimeToUtc(`2021-07-29 12:00`, 'America/Los_Angeles'),
      ]

      const business: any = {
        slot_interval: 30,
        timezone: 'America/Los_Angeles',
      }
      const actual = slotTimesToRanges({ slotTimeRanges, slotTimeOverrides, business })

      const expected = [
        {
          slots_date: '2021-07-27',
          slots_start_time: '12:30',
          slots_end_time: '12:30',
        },
        {
          slots_date: '2021-07-28',
          slots_start_time: '11:00',
          slots_end_time: '13:00',
        },
        {
          slots_date: '2021-07-29',
          slots_start_time: '12:00',
          slots_end_time: '12:00',
        },
      ]
      expect(actual).to.deep.eq(expected)
    })

    it('should return an empty array if no slotTimeOverrides given in range', async () => {
      const slotTimeRanges = [
        {
          slots_date: '2021-07-28',
          slots_start_time: '10:00',
          slots_end_time: '15:00',
        },
        {
          slots_date: '2021-07-29',
          slots_start_time: '10:00',
          slots_end_time: '15:00',
        },
        {
          slots_date: '2021-07-27',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
      ]

      const slotTimeOverrides = [
        // These are not in the range, so they'll be excluded completely
        dateFnsTz.zonedTimeToUtc(`2021-07-27 11:30`, 'America/Los_Angeles'),
        dateFnsTz.zonedTimeToUtc(`2021-07-27 10:00`, 'America/Los_Angeles'),
      ]

      const business: any = {
        slot_interval: 30,
        timezone: 'America/Los_Angeles',
      }
      const actual = slotTimesToRanges({ slotTimeRanges, slotTimeOverrides, business })

      const expected: Date[] = []
      expect(actual).to.deep.eq(expected)
    })
  })

  describe('getSlotTimes', () => {
    it('should return all slots if no overrides specified', async () => {
      const business: any = { timezone: 'America/Los_Angeles', slot_interval: 30 }
      const slots_date = '2021-04-20'
      const slotTimeRanges = [
        {
          slots_date,
          slots_start_time: '11:00',
          slots_end_time: '14:00',
        },
      ]

      const actual = map((a) => a.toISOString(), getSlotTimes({ business, slotTimeRanges }))

      const expected = [
        '2021-04-20T18:00:00.000Z',
        '2021-04-20T18:30:00.000Z',
        '2021-04-20T19:00:00.000Z',
        '2021-04-20T19:30:00.000Z',
        '2021-04-20T20:00:00.000Z',
        '2021-04-20T20:30:00.000Z',
        '2021-04-20T21:00:00.000Z',
      ]

      expect(actual).to.deep.eq(expected)
    })

    it('should return an empty array of slotTimeOverrides is given as an empty array', async () => {
      const business: any = { timezone: 'America/Los_Angeles', slot_interval: 30 }
      const slots_date = '2021-04-20'
      const slotTimeRanges = [
        {
          slots_date,
          slots_start_time: '11:00',
          slots_end_time: '14:00',
        },
      ]

      const actual = map(
        (a) => a.toISOString(),
        getSlotTimes({ business, slotTimeRanges, slotTimeOverrides: [] })
      )

      const expected: any = []

      expect(actual).to.deep.eq(expected)
    })

    it('should return slotTimeOverrides if provided, even if out of range', async () => {
      const business: any = { timezone: 'America/Los_Angeles', slot_interval: 30 }
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

        // This is outside the range, but still legit because it's an override
        dateFnsTz.zonedTimeToUtc(`${slots_date} 23:00`, business.timezone),
      ]

      const actual = map(
        (a) => a.toISOString(),
        getSlotTimes({ business, slotTimeRanges, slotTimeOverrides })
      )

      const expected: any = [
        '2021-04-20T18:00:00.000Z',
        '2021-04-20T20:30:00.000Z',
        '2021-04-21T06:00:00.000Z',
      ]

      expect(actual).to.deep.eq(expected)
    })
  })
})
