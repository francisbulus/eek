import {
  compact,
  filter,
  first,
  flatten,
  flow,
  isEmpty,
  last,
  map,
  negate,
  sortBy,
} from 'lodash/fp'
import type { Business } from 'prisma-seated'

import { formatInTimeZone, makeTimeRange } from './date'
import type { ISlotTimeRange, TSlotTimesOrRanges } from './types'

/**
 * Given an array of slot time ranges, an interval, and a timezone, return all the slots
 */
const allSlotTimes = ({
  interval,
  slotTimeRanges,
  tz,
}: {
  interval: number
  tz: string
  slotTimeRanges: ISlotTimeRange[]
}) =>
  flow(
    map((slot_time_range: ISlotTimeRange) =>
      makeTimeRange({
        date: slot_time_range.slots_date,
        start: slot_time_range.slots_start_time,
        end: slot_time_range.slots_end_time,
        interval,
        tz,
      })
    ),
    flatten,
    sortBy((d) => d.valueOf())
  )(slotTimeRanges) as Date[]

/**
 * Given an array of slot times, create the minimal set of slot time ranges that would cover them.
 * Output is all in business's time zone.
 */
const slotTimesToRanges = ({
  slotTimeRanges,
  slotTimeOverrides,
  business,
}: {
  slotTimeRanges: ISlotTimeRange[]
  slotTimeOverrides: Date[]
  business: Business
}): ISlotTimeRange[] => {
  const slotTimeOverridesUtc = map((d) => d.toISOString(), slotTimeOverrides)

  // 1. Generate all the slot times, tied back to the slot time ranges that generated them
  const all: Date[][] = map((slot_time_range: ISlotTimeRange) => {
    const timesForRange = makeTimeRange({
      date: slot_time_range.slots_date,
      start: slot_time_range.slots_start_time,
      end: slot_time_range.slots_end_time,
      interval: business.slot_interval,
      tz: business.timezone,
    })

    // 2. for each slot time range, add it to the array if it's included in slotTimeOverrides
    return flow(
      map((t: Date) => (slotTimeOverridesUtc.includes(t.toISOString()) ? t : undefined)),
      compact,
      sortBy((d: Date) => d.valueOf())
    )(timesForRange)
  }, slotTimeRanges)

  return flow(
    filter(negate(isEmpty)),
    map((dateArr: Date[]) => {
      const slots_date = formatInTimeZone({
        date: first(dateArr) as Date,
        tz: business.timezone,
        fmt: 'yyyy-MM-dd',
      })
      const slots_start_time = formatInTimeZone({
        date: first(dateArr) as Date,
        tz: business.timezone,
        fmt: 'HH:mm',
      })
      const slots_end_time = formatInTimeZone({
        date: last(dateArr) as Date,
        tz: business.timezone,
        fmt: 'HH:mm',
      })
      return { slots_date, slots_start_time, slots_end_time }
    }),
    sortBy(['slots_date', 'slots_start_time'])
  )(all)
}

/**
 * Given an array of slotTimeRanges, return an array of Dates to represent the actual slot times
 * The given slot time ranges can be overriden by slotTimeOverrides.
 * slotTimeOverrides can be outside of the slotTimeRanges
 *
 * Note: It's possible that slotTimeOverrides is an empty array, which will return an empty array
 */
const getSlotTimes = ({
  business,
  slotTimeRanges,
  slotTimeOverrides,
}: {
  business: Business
} & TSlotTimesOrRanges) =>
  slotTimeOverrides ??
  allSlotTimes({
    slotTimeRanges: slotTimeRanges as ISlotTimeRange[],
    interval: business.slot_interval,
    tz: business.timezone,
  })

export { allSlotTimes, getSlotTimes, slotTimesToRanges }
