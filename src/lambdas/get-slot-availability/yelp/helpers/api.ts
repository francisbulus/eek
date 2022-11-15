import logger from '@invisible/logger'
import { oneLineTrim } from 'common-tags'
import * as dateFns from 'date-fns'
import {
  compact,
  each,
  filter,
  first,
  flatten,
  flow,
  isEmpty,
  last,
  map,
  reduce,
  size,
  split,
  toPairs,
  values,
} from 'lodash/fp'
import pMap from 'p-map'
import pSleep from 'p-sleep'
import type { Business } from 'prisma-seated'

import { prisma } from '../../config/prisma'
import {
  epochMs,
  epochSeconds,
  formatInTimeZone,
  makeStartAndEndTime,
  makeTimeRange,
} from '../../helpers/date'
import { handleKnownErrors } from '../../helpers/errors'
import { getKillSwitch } from '../../helpers/killSwitch'
import { getAvailabilityAndParseFactory } from '../../helpers/scrape'
import type { TSeatedSlotAvailability } from '../../helpers/seated'
import { getSlotTimes, slotTimesToRanges } from '../../helpers/slot'
import type {
  ISlotTimeRange,
  IValidYelpBusiness,
  TScrapeAndParseArgs,
  TScrapeAndParseFn,
  TSlotTimesOrRanges,
} from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'
import { yelpRequest } from './request'

const PLATFORM_NAME = PLATFORMS.YELP
const REQ_CONCURRENCY = 10
const MAX_RETRIES = 20
const YELP_RETRY_SLEEP_MS = 8000
const YELP_RETRY_MIN_SLEEP_MS = 2000
const YELP_BASE_TIMEOUT = 7000

interface IYelpApiResult {
  success: boolean
  availability_data: IYelpAvailabilityObj[]
}

interface IYelpAvailabilityObj {
  availability_list: IYelpSlot[]
  msg: string
}

interface IYelpSlot {
  timestamp: number
  isodate: string
}

/**
 * A yelp slots obj has the epochSeconds of the time as the key, and true, false, or null as the value
 */
interface ISlotsObj extends Record<number, boolean | null> {}

/**
 * Returns just the restaurant slug from a yelp url
 * Undefined behavior if not given a yelp url
 */
const yelpSlug = (url: string) => flow(split('/'), last, split('?'), first)(url)

/**
 * Returns a yelp url for a given business, date/time and party size
 *
 * Takes a business to remove confusion about `biz_id` (which is stored as url_id in our DB)
 *
 * Yelp can return many results for a day, as well as multiple days, so we can utilize that to
 * reduce the number of requests. Just don't get too greedy or we'll appear suspect
 */
const yelpUrl = ({
  business,
  date,
  party_size,
  time,
  days_after = 0,
  num_results_after = 24,
}: {
  business: IValidYelpBusiness
  date: string
  party_size: number
  time: string
  days_after?: number
  num_results_after?: number
}) => {
  const slug = yelpSlug(business.url)
  const ret = oneLineTrim`
    https://www.yelp.com/reservations/${slug}/search_availability?
    append_request=false&
    biz_id=${business.url_id}&
    biz_lat=${business.latitude}&
    biz_long=${business.longitude}&
    covers=${party_size}&
    date=${date}&
    days_after=${days_after}&
    days_before=0&
    num_results_after=${num_results_after}&
    num_results_before=0&
    search_type=URL_INITIATE_SEARCH&
    time=${time}&
    weekly_search_enabled=true
  `
  return ret
}

const slotTimeRangeToKey = (str: ISlotTimeRange): string =>
  `${str.slots_date}-${str.slots_start_time}-${str.slots_end_time}`

const isValidResponse = (resp?: IYelpApiResult) =>
  Boolean(resp?.success) && Boolean(resp?.availability_data?.[0]?.availability_list)

/**
 * Given a slot time range and a slotsObj, marks all the slots in that range as unavailable
 *
 * Should only be calling this when we are sure that the entire range is unavailable
 */
const markUnavailable = ({
  slot_time_range,
  business,
  slotsObj,
}: {
  slot_time_range: ISlotTimeRange
  business: Business
  slotsObj: ISlotsObj
}) => {
  const timesToMarkArgs = {
    date: slot_time_range.slots_date,
    start: slot_time_range.slots_start_time,
    end: slot_time_range.slots_end_time,
    interval: business.slot_interval,
    tz: business.timezone,
  }

  const timesToMark = makeTimeRange(timesToMarkArgs)

  each((t: Date) => {
    const k = epochSeconds(t)
    slotsObj[k] = false
  }, timesToMark)
}

/**
 * external_id is the id that we get from seated. from seated's perspective it would be business_id.
 * In our database, we store it as external_id
 *
 * Yelp is a unique case in that we have to aggregate several requests, so we don't return the raw result
 */
const getYelpData = async ({
  business,
  party_size,
  slotTimeRanges,
  slotTimeOverrides,
  useProxy = true,
}: {
  business: IValidYelpBusiness
  party_size: number
  useProxy?: boolean
} & TSlotTimesOrRanges): Promise<{
  slotsObj: ISlotsObj
  numRequests: number
  retryCount: number
}> => {
  const slotTimes = getSlotTimes({ business, slotTimeRanges, slotTimeOverrides })

  let retryCount = 0

  const slotsObj: ISlotsObj = reduce(
    (acc, t: Date) => ({ ...acc, [epochSeconds(t)]: null }),
    {},
    slotTimes
  )

  let numRequests = 0

  const actualSlotTimeRanges = slotTimeOverrides
    ? slotTimesToRanges({ slotTimeRanges, slotTimeOverrides, business })
    : slotTimeRanges

  // Returns all the results for a single slot time range
  // Note: will simply return slots that are available, so unavailable slots are slots that are not returned
  // Since we can request many slots at a time, this works out, and we can get the entire range in one request
  const getYelpDataForOneSlotRange = async (slot_time_range: ISlotTimeRange) => {
    let numNullSlots = size(filter((x) => x === null, values(slotsObj)))
    if (numNullSlots === 0) {
      logger.debug(`${PLATFORM_NAME}: All slots for all time ranges already found, skipping`, {
        business,
        party_size,
        slot_time_range,
      })
      return
    }

    const { slots_date, slots_start_time, slots_end_time } = slot_time_range

    const slotTimesForRange = makeTimeRange({
      date: slots_date,
      start: slots_start_time,
      end: slots_end_time,
      interval: business.slot_interval,
      tz: business.timezone,
    })

    const allNonNull = isEmpty(
      filter((d: Date) => slotsObj[epochSeconds(d)] === null, slotTimesForRange)
    )
    if (allNonNull) {
      logger.debug(
        `${PLATFORM_NAME}: All slots for this range have been checked, returning early`,
        { business, party_size, slot_time_range }
      )
      return true
    }

    const { startTime, endTime } = makeStartAndEndTime({
      date: slots_date,
      start: slots_start_time,
      end: slots_end_time,
      tz: business.timezone,
    })
    const minutes = dateFns.differenceInMinutes(endTime, startTime)
    const iterations = minutes / business.slot_interval + 1

    const makeRequest = async () => {
      numNullSlots = size(filter((x) => x === null, values(slotsObj)))
      if (numNullSlots === 0) {
        logger.debug(`${PLATFORM_NAME}: All slots already found, skipping`)
        return true
      }
      numRequests += 1

      const url = yelpUrl({
        business,
        party_size,
        time: formatInTimeZone({ date: startTime, tz: business.timezone, fmt: 'HH:mm:ss' }),
        date: slot_time_range.slots_date,
        days_after: 3,
        num_results_after: iterations,
      })

      const responseTimeout = YELP_BASE_TIMEOUT * Math.pow(1.05, retries)

      return yelpRequest({
        url,
        referer: business.url,
        useProxy,
        responseTimeout,
      })
    }

    // We handle retries per time slot requested
    let retries = 0
    while (retries < MAX_RETRIES) {
      if (await getKillSwitch()) {
        logger.info(`${PLATFORM_NAME}: killswitch activated, exiting now`)
        await prisma.$disconnect()
        process.exit(1)
      }

      logger.debug(
        `${PLATFORM_NAME}: Requesting for ${slotTimeRangeToKey(
          slot_time_range
        )}, retry: ${retries}`,
        {
          slot_time_range,
          retries,
          numHandles: (process as any)._getActiveHandles().length,
        }
      )
      if (retries === MAX_RETRIES - 1) {
        const warnMeta = {
          business,
          party_size,
          retries,
          slotRange: slotTimeRangeToKey(slot_time_range),
        }
        logger.warn(`${PLATFORM_NAME}: final retry`, warnMeta)
      }
      try {
        const response = await makeRequest()
        if (response === true) {
          // logger.debug(`${PLATFORM_NAME}: slot already exists, skipping`)
          return
        }

        const body: IYelpApiResult = response.body

        if (isEmpty(body)) {
          logger.warn(`${PLATFORM_NAME}: Empty response body, probably a captcha`, {
            response,
            business,
            party_size,
            slot_time_range,
          })
          retryCount += 1
          retries += 1
          continue
        }

        // responses.push(body)

        if (response.status === 200 && !isValidResponse(body)) {
          logger.error(`${PLATFORM_NAME}: 200, but response does not match expected structure`, {
            body,
            business,
            party_size,
            slot_time_range,
          })
          retryCount += 1
          retries += 1
          continue
        }

        if (body?.availability_data?.[0]?.msg?.startsWith('Sorry! There are no tables for')) {
          logger.info(
            `${PLATFORM_NAME}: No availability for that date and party size, can skip rest of checks here`,
            {
              body,
              business,
              party_size,
              slot_time_range,
            }
          )

          markUnavailable({ slot_time_range, business, slotsObj })
        }

        logger.info(`${PLATFORM_NAME}: request succeeded`, { business, party_size, retries })

        // If we've made it this far, we have a good response!
        const newSlots = flatten(map('availability_list', body.availability_data))

        // First, we mark any null slots in the range as false.
        each((d: Date) => {
          if (slotsObj[epochSeconds(d)] === null) {
            slotsObj[epochSeconds(d)] = false
          }
        }, slotTimesForRange)

        // Then, we mark any in the new slots as true, including stuff outside the range
        each((s: IYelpSlot) => (slotsObj[s.timestamp] = true), newSlots)

        return
      } catch (err: any) {
        const errMeta = {
          business,
          slot_time_range,
          party_size,
          retries,
          stack: err.stack,
          err,
          numHandles: (process as any)._getActiveHandles().length,
          memoryMB: process.memoryUsage().heapUsed / 1024 / 1024,
        }

        handleKnownErrors({ PLATFORM_NAME, err, errMeta })

        const sleepMs =
          Math.random() * (1 + (1.0 * retries) / MAX_RETRIES) * YELP_RETRY_SLEEP_MS +
          YELP_RETRY_MIN_SLEEP_MS

        await pSleep(sleepMs)

        retries += 1
        retryCount += 1
        continue
      }
    }

    logger.error(`${PLATFORM_NAME}: maximum retries reached`, {
      business,
      slot_time_range,
      party_size,
    })

    return
  }

  await pMap(actualSlotTimeRanges, getYelpDataForOneSlotRange, { concurrency: REQ_CONCURRENCY })

  const nullSlots = filter((x) => x[1] === null, toPairs(slotsObj))
  const numNullSlots = size(nullSlots)
  if (numNullSlots > 0) {
    logger.error(`${PLATFORM_NAME}: some null slots found`, {
      business,
      party_size,
      slotTimeRanges,
      slotTimeOverrides,
      nullSlots,
    })
  }

  return { slotsObj, numRequests, retryCount }
}

/**
 * Given a slots obj, return all the slot availability information in seated format.
 *
 * Includes slots that are unavailable.
 * Limits results to specified time range or specific slots of slotTimeOverrides given.
 * The absence of a time in the availability array indicates that it is not available.
 * slots_date, slots_start_time, slots_end_time are in the business's timezone.
 */
const slotAvailability = ({
  business,
  slotsObj,
  slotTimeRanges,
  slotTimeOverrides,
  humanReadableDate,
}: {
  business: IValidYelpBusiness
  slotsObj: ISlotsObj
  humanReadableDate?: boolean
} & TSlotTimesOrRanges): TSeatedSlotAvailability[] => {
  const slotTimes = getSlotTimes({ business, slotTimeRanges, slotTimeOverrides })

  return compact(
    map((slotTime: Date) => {
      const val = slotsObj[epochSeconds(slotTime)]
      if (val === null || val === undefined) return
      return {
        slot_date: epochMs(slotTime),
        available: Boolean(val), // can't be null at this point
        ...(humanReadableDate
          ? {
              humanReadableDate: formatInTimeZone({
                date: slotTime,
                tz: business.timezone,
                fmt: `yyyy-MM-dd'T'HH:mm`,
              }),
            }
          : {}),
      }
    }, slotTimes)
  )
}

const scrapeAndParse: TScrapeAndParseFn<IValidYelpBusiness> = async ({
  business,
  party_size,
  slotTimeRanges,
  slotTimeOverrides,
  humanReadableDate = false,
  useProxy = true,
}: TScrapeAndParseArgs<IValidYelpBusiness>) => {
  const { retryCount, numRequests, slotsObj } = await getYelpData({
    business,
    party_size,
    slotTimeRanges,
    slotTimeOverrides,
    useProxy,
  })

  const slots = slotAvailability({
    slotsObj,
    business,
    slotTimeRanges,
    slotTimeOverrides,
    humanReadableDate,
  })

  const payload = {
    business_id: business.external_id,
    business_name: business.name,
    interval: business.slot_interval,
    time_of_check: epochMs(new Date()),
    site_checked: business.platform,
    data: [{ party_size, slots }],
  }

  return { payload, retryCount, numRequests }
}

const getAvailabilityAndParse = getAvailabilityAndParseFactory({
  platform: PLATFORM_NAME,
  scrapeAndParseFn: scrapeAndParse,
})

export {
  getAvailabilityAndParse,
  getYelpData,
  isValidResponse,
  markUnavailable,
  scrapeAndParse,
  slotAvailability,
  slotTimeRangeToKey,
  yelpSlug,
  yelpUrl,
}

export type { IYelpApiResult }
