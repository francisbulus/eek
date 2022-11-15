import { expect } from 'chai'
import timekeeper from 'timekeeper'

import { cohortSchedulesToTimeRanges } from './cohortSchedule'
import { parseAsUTC } from './date'

describe('cohortSchedulesToTimeRanges', () => {
  describe('getDateInTz', () => {
    beforeEach(() => timekeeper.freeze(parseAsUTC('2021-07-26 09:00:00'))) // Monday
    afterEach(() => timekeeper.reset())

    it('should return the correct time ranges', async () => {
      const cohortSchedules = [
        {
          slots_dow: 'monday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'monday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'tuesday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'tuesday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'wednesday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'wednesday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'thursday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'thursday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'friday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'saturday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
      ]

      const actual = cohortSchedulesToTimeRanges(cohortSchedules as any, 0)
      const expected = [
        {
          slots_date: '2021-07-26',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-07-26',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-07-27',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-07-27',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-07-28',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-07-28',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-07-29',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-07-29',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-07-30',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-07-31',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
      ]
      expect(actual).to.deep.eq(expected)
    })
  })

  describe('getFutureDatesInTz', () => {
    beforeEach(() => timekeeper.freeze(parseAsUTC('2021-12-06 09:00:00'))) // Monday
    afterEach(() => timekeeper.reset())

    it('should return the correct time ranges', async () => {
      const cohortSchedules = [
        {
          slots_dow: 'monday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'monday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'tuesday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'tuesday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'wednesday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'wednesday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'thursday',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_dow: 'thursday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'friday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_dow: 'saturday',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
      ]

      const actual = cohortSchedulesToTimeRanges(cohortSchedules as any, 7)
      const expected = [
        {
          slots_date: '2021-12-13',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-12-13',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-12-14',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-12-14',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-12-15',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-12-15',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-12-16',
          slots_start_time: '12:00',
          slots_end_time: '14:00',
        },
        {
          slots_date: '2021-12-16',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-12-17',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
        {
          slots_date: '2021-12-18',
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
      ]
      expect(actual).to.deep.eq(expected)
    })
  })
})
