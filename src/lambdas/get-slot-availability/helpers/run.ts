import logger from '@invisible/logger'
import { oneLineTrim } from 'common-tags'
import * as dateFns from 'date-fns'
import {
  difference,
  each,
  filter,
  find,
  flatten,
  flow,
  isEmpty,
  keys,
  map,
  reduce,
  reverse,
  sortBy,
  uniqBy,
} from 'lodash/fp'
import type { day_of_week_names, Run } from 'prisma-seated'
import { scrape_statuses } from 'prisma-seated'

import { BusinessLogicError } from '../../../helpers/errors'
import { prisma } from '../config/prisma'
import { epochMs } from './date'
import type { TSeatedPayload, TSeatedPayloadDatum, TSeatedSlotAvailability } from './seated'
import { allSlotTimes } from './slot'
import type { ISlotTimeRange, IValidBusiness, TPlatform } from './types'

const {
  success: SUCCESS,
  processing: PROCESSING,
  done_incomplete: DONE_INCOMPLETE,
} = scrape_statuses

interface IExistingRun extends Run {
  scrape_status: typeof DONE_INCOMPLETE | typeof SUCCESS | typeof PROCESSING
}

/**
 * Finds existing runs for the given config.
 *
 * Note that multiple runs can exist with the same status
 */
const getExistingRuns = async ({
  batch_id,
  business,
  check_dow,
  check_time,
  force,
  party_size,
  test_mode,
  cohort_external_id,
  cohort_id,
}: {
  batch_id: number
  business: IValidBusiness
  check_dow: day_of_week_names
  check_time: string
  force?: boolean
  party_size: number
  test_mode?: boolean
  cohort_external_id: number
  cohort_id: number
}): Promise<IExistingRun[]> =>
  test_mode || force
    ? []
    : (prisma.run.findMany({
        where: {
          batch_id,
          business_id: business.id,
          check_dow,
          check_time,
          cohort_external_id,
          cohort_id,
          deleted_at: null,
          party_size,
          test_mode: false,
          OR: [
            { scrape_status: DONE_INCOMPLETE },
            { scrape_status: SUCCESS },
            {
              scrape_status: PROCESSING,
              created_at: { gt: dateFns.addMinutes(new Date(), -15) },
            },
          ],
        },
      }) as Promise<IExistingRun[]>)

/**
 * Performs the business logic of what counts as a "relevant" existing run
 */
const getRelevantExistingRuns = (runs: IExistingRun[]) => {
  // No existing found, or exactly one found, so return it
  if (isEmpty(runs) || runs.length === 1) return runs

  const success = find({ scrape_status: SUCCESS }, runs)
  const processing = find({ scrape_status: PROCESSING }, runs)

  // Priority is success, process, done_incomplete
  if (success) return [success]
  if (processing) return [processing]
  return runs
}

type TSeatedSlotAvailabilityObject = Record<string, Record<string, boolean>>

const flattenSlotAvailabilityObject = (
  merged: TSeatedSlotAvailabilityObject
): TSeatedPayloadDatum[] =>
  map((party_size: string) => {
    const slots = (map(
      (slot_date: string) => ({
        slot_date: parseInt(slot_date, 10),
        available: Boolean(merged[party_size][slot_date]),
      }),
      keys(merged[party_size])
    ) as unknown) as TSeatedSlotAvailability[]
    return {
      party_size: parseInt(party_size, 10),
      slots,
    }
  }, keys(merged))

/**
 * Curried function to add a single TSeatedPayloadDatum to a TSeatedSlotAvailabilityObject
 *
 * Slot availability from the datum will overwrite anything in the TSeatedSlotAvailabilityObject if it has the same
 * party_size and slot_date
 */
const addToSlotAvailabilityObject = (merged: TSeatedSlotAvailabilityObject = {}) => (
  datum: TSeatedPayloadDatum
) => {
  const { party_size } = datum
  if (!merged[`${party_size}`]) merged[`${party_size}`] = {}
  each((slot: TSeatedSlotAvailability) => {
    merged[`${party_size}`][`${slot.slot_date}`] = Boolean(slot.available)
  }, datum.slots)
  return merged
}

/**
 * Given two payloads for the same business, return a combined payload
 *
 * Slots found in payload2 will override the same slots in payload1
 */
const mergePayloads = (payload1: TSeatedPayload, payload2: TSeatedPayload): TSeatedPayload => {
  if (isEmpty(payload1) || isEmpty(payload1.data)) return payload2
  if (isEmpty(payload2) || isEmpty(payload2.data)) return payload1

  const sameFields: (keyof TSeatedPayload)[] = [
    'business_id',
    'business_name',
    'interval',
    'site_checked',
  ]
  each((field) => {
    if (payload1[field] !== payload2[field]) {
      throw new BusinessLogicError(`Trying to combine payloads from runs of different businesses`, {
        payload1,
        payload2,
      })
    }
  }, sameFields)

  const [p1, p2] = sortBy('time_of_check', [payload1, payload2])

  // Merge the values of data2 into data1, overwriting if we have collisions
  const obj: TSeatedSlotAvailabilityObject = {}
  each(addToSlotAvailabilityObject(obj), p1.data)
  each(addToSlotAvailabilityObject(obj), p2.data)

  const { business_id, business_name, interval, site_checked, time_of_check } = p2

  return {
    business_id,
    business_name,
    interval,
    site_checked,
    time_of_check,
    data: flattenSlotAvailabilityObject(obj),
  }
}

const mergeAllPayloads = (payloads: TSeatedPayload[]) =>
  reduce(
    (acc: TSeatedPayload, curr: TSeatedPayload) => mergePayloads(acc, curr),
    {} as TSeatedPayload,
    payloads
  )

/**
 * Combines payloads from an array of runs
 *
 * Newer payloads will override older ones if there are collisions
 */
const combineRunPayloads = (runs: Run[]): TSeatedPayload | undefined => {
  const hasPayload = filter((r: Run) => !isEmpty(r.payload), runs) as Run[]

  if (isEmpty(hasPayload)) return undefined

  const { business_id, business_name, interval, site_checked } = hasPayload[0]
    .payload as TSeatedPayload
  const filtered = filter(
    { business_id, business_name, interval, site_checked },
    map('payload', hasPayload)
  )
  if (hasPayload.length !== filtered.length) {
    throw new BusinessLogicError(`Trying to combine payloads from runs of different businesses`, {
      runs,
    })
  }

  return mergeAllPayloads(map('payload', sortBy('created_at', hasPayload)))
}

/**
 * Returns the full payload if success, combined payload if done_incomplete, undefined otherwise
 */
const payloadFromExisting = ({
  runs,
  platform,
}: {
  runs?: IExistingRun[]
  platform: TPlatform
}) => {
  if (!runs || runs.length === 0) return undefined

  // This part is tightly coupled with getRelevantExistingRuns
  const run = runs[0]
  if (run.payload && run.scrape_status === SUCCESS) {
    logger.info(`${platform}: found existing success run`, { runs })
    return run.payload as TSeatedPayload
  }

  if (run.scrape_status === DONE_INCOMPLETE) {
    logger.info(`${platform}: found existing done_incomplete runs`, { runs })
    const doneIncomplete = filter({ scrape_status: DONE_INCOMPLETE }, runs)

    if (doneIncomplete.length !== runs.length) {
      // This should never happen.
      // If it does, log it, but still combine and return
      logger.warn(`Something wacky happened, runs.length !== doneIncomplete.length`, {
        runs,
      })
    }

    return combineRunPayloads(runs)
  }

  if (run.scrape_status === PROCESSING) {
    logger.info(`${platform}: found existing processing run`, { runs })
    return
  }

  // This should never happen, because it's tightly coupled with the relevantExisting
  logger.warn(
    oneLineTrim`Something wacky happened, runs found that are not
        ${SUCCESS}, ${PROCESSING}, ${DONE_INCOMPLETE}
      `,
    { runs }
  )
  return
}

const createRun = async ({
  slotTimeRanges,
  business,
  batch_id,
  check_dow,
  check_time,
  party_size,
  test_mode,
  cohort_external_id,
  cohort_id,
}: {
  slotTimeRanges: ISlotTimeRange[]
  business: IValidBusiness
  batch_id: number
  check_dow: day_of_week_names
  check_time: string
  party_size: number
  test_mode?: boolean
  cohort_external_id: number
  cohort_id: number
}) => {
  const slotTimes = allSlotTimes({
    slotTimeRanges,
    interval: business.slot_interval,
    tz: business.timezone,
  })

  return prisma.run.create({
    data: {
      batch_id,
      cohort_id,
      cohort_external_id,
      business_id: business.id,
      check_dow,
      check_time,
      party_size,
      test_mode,
      expected_num_slots: slotTimes.length,
      started_at: new Date(),
      scrape_status: PROCESSING,
    },
  })
}

/**
 * Retrieves the relevant existing runs for a given config.
 * Also returns the full payload if success, or combined payload if multiple done_incomplete.
 *
 * Tightly coupled with getRelevantExistingRuns for now, can refact later to simplify
 */
const getExistingRunAndPayloadOrCreate = async ({
  batch_id,
  business,
  check_dow,
  check_time,
  cohort_external_id,
  cohort_id,
  force,
  party_size,
  platform,
  slotTimeRanges,
  test_mode,
}: {
  batch_id: number
  business: IValidBusiness
  check_dow: day_of_week_names
  check_time: string
  cohort_external_id: number
  cohort_id: number
  force?: boolean
  party_size: number
  platform: TPlatform
  slotTimeRanges: ISlotTimeRange[]
  test_mode?: boolean
}): Promise<{
  existing?: Run[]
  payload?: TSeatedPayload
  run?: Run
  scrape_status?: scrape_statuses
}> => {
  const existing = await getExistingRuns({
    batch_id,
    business,
    check_dow,
    check_time,
    cohort_external_id,
    cohort_id,
    force,
    party_size,
    test_mode,
  })

  const relevantExisting = getRelevantExistingRuns(existing)

  // Making this a thunk to DRY it up, since we need it twice
  const newRun = async () =>
    createRun({
      batch_id,
      business,
      check_dow,
      check_time,
      cohort_external_id,
      cohort_id,
      party_size,
      slotTimeRanges,
      test_mode,
    })

  if (!isEmpty(relevantExisting)) {
    const run = relevantExisting[0]
    if (run.scrape_status === PROCESSING || run.scrape_status === SUCCESS) {
      const payload = payloadFromExisting({ runs: relevantExisting, platform })
      return {
        existing: relevantExisting,
        payload,
        run: undefined,
        scrape_status: run.scrape_status,
      }
    } else if (run.scrape_status === DONE_INCOMPLETE) {
      // No success, no processing. At least one done_incomplete exists.
      // Thus, we create a new run with the same config

      const run = await newRun()
      const payload = payloadFromExisting({ runs: relevantExisting, platform })

      return {
        existing,
        payload,
        run,
        scrape_status: DONE_INCOMPLETE,
      }
    } else {
      // This should only happen if getRelevantExistingRuns changes.
      // This makes these functions tightly coupled for now

      throw new BusinessLogicError(`Something wacky happened: getExistingRunAndPayloadOrCreate`, {
        existing,
      })
    }
  }

  const run = await newRun()
  return { run } // Everything else is undefined
}

/**
 * Given a seated payload, returns all slots for the given party_size
 *
 * If there are multiple TSeatedPayloadDatum for the same party_size, later one overrides earlier one
 */
const slotsForPartySize = ({
  party_size,
  payload,
}: {
  party_size: number
  payload: TSeatedPayload
}): TSeatedSlotAvailability[] =>
  (flow(
    filter({ party_size }),
    flatten,
    map('slots'),
    flatten,
    reverse, // so that any collisions are resolved by taking the later one
    uniqBy('slot_date'), // uniqBy takes the first one meeting the criteria
    sortBy('slot_date')
  )(payload.data) as unknown) as TSeatedSlotAvailability[]

/**
 * Finds the missing slots, given an array of slotTimeRanges, a business, and a seated payload
 *
 * Returns an array of dates (no timezone, so UTC)
 * Returns an empty array if the payload fully covers slotTimeRanges
 */
const getMissingSlots = ({
  slotTimeRanges,
  business,
  payload,
  party_size,
}: {
  slotTimeRanges: ISlotTimeRange[]
  business: IValidBusiness
  payload?: TSeatedPayload
  party_size: number
}): Date[] => {
  const expectedSlots = allSlotTimes({
    slotTimeRanges,
    interval: business.slot_interval,
    tz: business.timezone,
  })

  if (!payload) return expectedSlots

  const existingSlots = map('slot_date', slotsForPartySize({ party_size, payload }))
  const expectedEpochMs = map(epochMs, expectedSlots)

  const missing = difference(expectedEpochMs, existingSlots)
  return map((ms: number) => new Date(ms), missing)
}

export type { TSeatedSlotAvailabilityObject }

export {
  addToSlotAvailabilityObject,
  combineRunPayloads,
  createRun,
  flattenSlotAvailabilityObject,
  getExistingRunAndPayloadOrCreate,
  getExistingRuns,
  getMissingSlots,
  getRelevantExistingRuns,
  mergeAllPayloads,
  mergePayloads,
  payloadFromExisting,
  slotsForPartySize,
}
