import { expect } from 'chai'
import * as dateFnsTz from 'date-fns-tz'
import timekeeper from 'timekeeper'

import { getCurrentCheckTime } from './multi-helper'

describe('multi-helper', () => {
  // describe('concurrencyConfig', () => {
  //   it('should return the correct configs', async () => {
  //     const args = [
  //       [80, 688, 2, 20, 5],
  //       [146, 239, 3, 15, 2],
  //       [32, 688, 2, 20, 8],
  //       [32, 239, 3, 15, 8],
  //       [28, 688, 2, 20, 8],
  //       [48, 239, 3, 15, 6],
  //       [20, 688, 2, 20, 8],
  //       [77, 239, 3, 15, 3],
  //       [87, 688, 2, 20, 5],
  //       [53, 239, 3, 15, 5],
  //     ]

  //     const allResults = map(
  //       ([num_slots, num_businesses, num_party_sizes, expected_fn_con, expected_biz_per]: [
  //         number,
  //         number,
  //         number,
  //         number,
  //         number
  //       ]) => ({
  //         ...concurrencyConfig({ num_slots, num_businesses, num_party_sizes }),
  //         num_slots,
  //         num_businesses,
  //         num_party_sizes,
  //         expected_fn_con,
  //         expected_biz_per,
  //       }),
  //       args
  //     ) as any[]

  //     each(
  //       ({
  //         functionConcurrency,
  //         businessesPerFunction,
  //         expected_fn_con,
  //         expected_biz_per,
  //         num_slots,
  //         num_businesses,
  //         num_party_sizes,
  //       }: {
  //         functionConcurrency: number
  //         businessesPerFunction: number
  //         expected_fn_con: number
  //         expected_biz_per: number
  //         num_slots: number
  //         num_businesses: number
  //         num_party_sizes: number
  //       }) => {
  //         expect(functionConcurrency).to.eq(
  //           expected_fn_con,
  //           `functionConcurrency: ${num_slots}, ${num_businesses}, ${num_party_sizes}`
  //         )
  //         expect(businessesPerFunction).to.eq(
  //           expected_biz_per,
  //           `businessesPerFunction: ${num_slots}, ${num_businesses}, ${num_party_sizes}`
  //         )
  //       },
  //       allResults
  //     )
  //   })
  // })

  describe('getCurrentCheckTime', () => {
    afterEach(() => timekeeper.reset())

    it('should return the correct check day of week and time, in New York time', async () => {
      const now = dateFnsTz.zonedTimeToUtc('2020-04-20 18:01:36.386', 'America/New_York')
      timekeeper.freeze(now)
      const { check_dow, check_time } = getCurrentCheckTime()
      expect(check_dow).to.eq('monday')
      expect(check_time).to.eq('18:00')
    })

    it('should round to the nearest half hour', async () => {
      const now = dateFnsTz.zonedTimeToUtc('2020-04-20 18:35:36.386', 'America/New_York')
      timekeeper.freeze(now)

      const { check_dow, check_time } = getCurrentCheckTime()
      expect(check_dow).to.eq('monday')
      expect(check_time).to.eq('18:30')
    })

    it('should round down to the nearest half hour', async () => {
      const now = dateFnsTz.zonedTimeToUtc('2020-04-21 17:25:36.386', 'America/New_York')
      timekeeper.freeze(now)

      const { check_dow, check_time } = getCurrentCheckTime()
      expect(check_dow).to.eq('tuesday')
      expect(check_time).to.eq('17:30')
    })
  })
})
