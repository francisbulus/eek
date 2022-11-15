import { expect } from 'chai'
import * as dateFnsTz from 'date-fns-tz'
import { forEach, map } from 'lodash/fp'
import timekeeper from 'timekeeper'

import { expectSameDate } from '../test/helpers/expectations'
import {
  compareOnlyTime,
  epochMs,
  formatAsUTC,
  formatInTimeZone,
  getDateInTz,
  makeStartAndEndTime,
  makeTimeRange,
  nextDateForDow,
  parseAsUTC,
  parseReparseUTC,
  roundTime,
} from './date'

describe('date helpers', () => {
  describe('formatInTimeZone', () => {
    it('should format the given time with zone as a time in a different zone', async () => {
      const la = dateFnsTz.zonedTimeToUtc('2020-04-20 01:23:45', 'America/Los_Angeles')
      const actual = formatInTimeZone({ date: la, tz: 'America/New_York' })
      expect(actual).to.eq('2020-04-20T04:23:45.000Z')
    })
  })
  describe('formatAsUTC', () => {
    it('should format a given time with zone as UTC', async () => {
      const la = dateFnsTz.zonedTimeToUtc('2020-04-20 01:23:45', 'America/Los_Angeles')
      const actual = formatAsUTC(la)
      expect(actual).to.eq('2020-04-20T08:23:45.000Z')

      const ny = dateFnsTz.zonedTimeToUtc('2020-04-20 01:23:45', 'America/New_York')
      const actual2 = formatAsUTC(ny)
      expect(actual2).to.eq('2020-04-20T05:23:45.000Z')
    })
  })
  describe('parseAsUTC', () => {
    it('should parse the string without time zone as UTC', async () => {
      const s = '2021-04-20 13:00'
      const utc = parseAsUTC(s)
      const actual = formatAsUTC(utc)
      expect(actual).to.eq('2021-04-20T13:00:00.000Z')

      const ny = formatInTimeZone({ date: utc, tz: 'America/New_York' })
      expect(ny).to.eq('2021-04-20T09:00:00.000Z')
    })
  })
  describe('makeTimeRange', () => {
    it('should work with a simple time range', async () => {
      const date = '2021-04-20'
      const start = '17:00'
      const end = '21:00'
      const interval = 30

      const actual = makeTimeRange({ date, start, end, interval })
      const actualStrings = map((d: Date) => formatAsUTC(d), actual)
      const expected = [
        '2021-04-20T17:00:00.000Z',
        '2021-04-20T17:30:00.000Z',
        '2021-04-20T18:00:00.000Z',
        '2021-04-20T18:30:00.000Z',
        '2021-04-20T19:00:00.000Z',
        '2021-04-20T19:30:00.000Z',
        '2021-04-20T20:00:00.000Z',
        '2021-04-20T20:30:00.000Z',
        '2021-04-20T21:00:00.000Z',
      ]

      expect(actualStrings).to.deep.eq(expected)
    })

    it('should work when range spans midnight', async () => {
      const date = '2021-04-20'
      const start = '21:00'
      const end = '01:00'
      const interval = 30

      const actual = makeTimeRange({ date, start, end, interval })
      const actualStrings = map((d: Date) => formatAsUTC(d), actual)
      const expected = [
        '2021-04-20T21:00:00.000Z',
        '2021-04-20T21:30:00.000Z',
        '2021-04-20T22:00:00.000Z',
        '2021-04-20T22:30:00.000Z',
        '2021-04-20T23:00:00.000Z',
        '2021-04-20T23:30:00.000Z',
        '2021-04-21T00:00:00.000Z',
        '2021-04-21T00:30:00.000Z',
        '2021-04-21T01:00:00.000Z',
      ]

      expect(actualStrings).to.deep.eq(expected)
    })

    it('should return just one time if start and end are equal', async () => {
      const date = '2021-04-20'
      const start = '21:00'
      const end = '21:00'
      const interval = 60

      const actual = makeTimeRange({ date, start, end, interval })
      const actualStrings = map((d: Date) => formatAsUTC(d), actual)
      const expected = ['2021-04-20T21:00:00.000Z']

      expect(actualStrings).to.deep.eq(expected)
    })

    it('should throw if the interval does not cleanly divide into the range', async () => {
      const date = '2021-04-20'
      const start = '21:00'
      const end = '22:00'
      const interval = 7

      try {
        makeTimeRange({ date, start, end, interval })
        throw new Error(`Didn't throw`)
      } catch (err: any) {
        expect(err.message).to.eq(
          'Interval of 7 minutes does not divide evenly for given time range 21:00 to 22:00.'
        )
      }
    })
  })
  describe('epochMs', () => {
    it('should give the epoch time, in milliseconds since 1970', async () => {
      const s = '1970-01-01 00:00:01'

      const actual = epochMs(parseAsUTC(s))
      expect(actual).to.eq(1000)
    })
  })
  describe('roundTime', () => {
    it('should round a date to the given interval (60 minutes by default)', async () => {
      const s = parseAsUTC('2020-04-20 04:20:05')
      const hour = roundTime(s)
      const halfHour = roundTime(s, 30 * 60 * 1000)

      expectSameDate(hour, '2020-04-20 04:00:00')
      expectSameDate(halfHour, '2020-04-20 04:30:00')
    })
  })
  describe('parseReparseUTC', () => {
    it('should parse a string as a UTC date', async () => {
      const s = '2021-04-20 13:00'
      const utc = parseReparseUTC(s)
      const actual = formatAsUTC(utc)
      expect(actual).to.eq('2021-04-20T13:00:00.000Z')
    })

    it('should return the same date if passed in', async () => {
      const s = parseAsUTC('2021-04-20 13:00')
      const utc = parseReparseUTC(s)
      const actual = formatAsUTC(utc)
      expect(actual).to.eq('2021-04-20T13:00:00.000Z')
    })
  })
  describe('makeStartAndEndTime', () => {
    it('should work with a simple time range', async () => {
      const date = '2021-04-20'
      const start = '17:00'
      const end = '21:00'
      const tz = 'America/Los_Angeles'

      const { startTime, endTime } = makeStartAndEndTime({ date, start, end, tz })

      // PDT is UTC -7, so the UTC time would be midnight since 17+7 = 24
      expect(startTime.toISOString()).to.eq('2021-04-21T00:00:00.000Z')
      expect(formatInTimeZone({ date: startTime, tz, fmt: 'yyyy-MM-dd HH:mm:ss xxx (z)' })).to.eq(
        '2021-04-20 17:00:00 -07:00 (PDT)'
      )
      expect(endTime.toISOString()).to.eq('2021-04-21T04:00:00.000Z')
      expect(formatInTimeZone({ date: endTime, tz, fmt: 'yyyy-MM-dd HH:mm:ss xxx (z)' })).to.eq(
        '2021-04-20 21:00:00 -07:00 (PDT)'
      )
    })

    it('should work when range spans midnight', async () => {
      const date = '2021-04-20'
      const start = '21:00'
      const end = '01:00'
      const tz = 'America/Los_Angeles'

      const { startTime, endTime } = makeStartAndEndTime({ date, start, end, tz })

      // PDT is UTC -7, so the UTC time would be 4AM the next day, since 21+7 = 28
      expect(startTime.toISOString()).to.eq('2021-04-21T04:00:00.000Z')
      expect(formatInTimeZone({ date: startTime, tz, fmt: 'yyyy-MM-dd HH:mm:ss xxx (z)' })).to.eq(
        '2021-04-20 21:00:00 -07:00 (PDT)'
      )
      expect(endTime.toISOString()).to.eq('2021-04-21T08:00:00.000Z', 'endTime')
      expect(formatInTimeZone({ date: endTime, tz, fmt: 'yyyy-MM-dd HH:mm:ss xxx (z)' })).to.eq(
        '2021-04-21 01:00:00 -07:00 (PDT)'
      )
    })

    it('should return just the one time if start and end are the same', async () => {
      const date = '2021-04-20'
      const start = '21:00'
      const end = '21:00'
      const tz = 'America/Los_Angeles'

      const { startTime, endTime } = makeStartAndEndTime({ date, start, end, tz })

      // PDT is UTC -7, so the UTC time would be 4AM the next day, since 21+7 = 28
      expect(startTime.toISOString()).to.eq('2021-04-21T04:00:00.000Z')
      expect(formatInTimeZone({ date: startTime, tz, fmt: 'yyyy-MM-dd HH:mm:ss xxx (z)' })).to.eq(
        '2021-04-20 21:00:00 -07:00 (PDT)'
      )
      expect(endTime.toISOString()).to.eq('2021-04-21T04:00:00.000Z', 'endTime')
      expect(formatInTimeZone({ date: endTime, tz, fmt: 'yyyy-MM-dd HH:mm:ss xxx (z)' })).to.eq(
        '2021-04-20 21:00:00 -07:00 (PDT)'
      )
    })
  })
  describe('getDateInTz', () => {
    beforeEach(() => timekeeper.freeze(parseAsUTC('2021-06-21')))
    afterEach(() => timekeeper.reset())

    it('should return the date in the given time zone', async () => {
      const actual = getDateInTz({ date: '2021-06-21', tz: 'America/Los_Angeles' })
      expect(actual).to.eq('2021-06-21')
    })

    it('should return the current date in the given time zone if no date specified', async () => {
      const actual = getDateInTz({ tz: 'America/Los_Angeles' })
      expect(actual).to.eq('2021-06-20')
    })
  })
  describe('nextDateForDow', () => {
    beforeEach(() => timekeeper.freeze(parseAsUTC('2021-07-27 09:00:00'))) // Tuesday
    afterEach(() => timekeeper.reset())

    it('should return today if given the same day of week', async () => {
      const actual = nextDateForDow({ dow: 'tuesday' })
      expectSameDate('2021-07-27 09:00:00', actual)
    })

    it('should day within the same week if later this week', async () => {
      const actual = nextDateForDow({ dow: 'thursday' })
      expectSameDate('2021-07-29 09:00:00', actual)
    })

    it('should day next week if it already passed this week', async () => {
      const actual = nextDateForDow({ dow: 'monday' })
      expectSameDate('2021-08-02 09:00:00', actual)
    })
  })

  it('ensure compareTimeOnly checks different dates and different timezones with same time', () => {
    const baseDate = '2019-11-12 05:00:00+0500'
    const checkDates = ['2022-12-13 01:00:00+0100', '2029-11-13 17:00:00-0700']
    forEach((d) => expect(compareOnlyTime(new Date(baseDate), new Date(d))).to.be.true, checkDates)
  })
})
