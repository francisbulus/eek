import logger from '@invisible/logger'
import { oneLineTrim } from 'common-tags'
import * as dateFnsTz from 'date-fns-tz'
import {
  compact,
  filter,
  findIndex,
  flatten,
  flow,
  groupBy,
  includes,
  isEmpty,
  map,
  sum,
  trim,
  uniq,
  uniqBy,
} from 'lodash/fp'
import pMap from 'p-map'
import type { Business } from 'prisma-seated'

import { FailedServiceError } from '../../../../helpers/errors'
import { prisma } from '../../config/prisma'
import { epochMs, formatInTimeZone, getDateInTz } from '../../helpers/date'
import { handleKnownErrors } from '../../helpers/errors'
import { getKillSwitch } from '../../helpers/killSwitch'
import { getAvailabilityAndParseFactory } from '../../helpers/scrape'
import type { TSeatedPayload, TSeatedSlotAvailability } from '../../helpers/seated'
import { allSlotTimes } from '../../helpers/slot'
import type {
  ISlotTimeRange,
  IValidResyBusiness,
  TScrapeAndParseArgs,
  TScrapeAndParseFn,
} from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'
import { refreshApiKey } from './apiKey'
import { resyRequest } from './request'

const PLATFORM_NAME = PLATFORMS.RESY

const MAX_RETRIES = 20
const REQ_CONCURRENCY = 10
const RESY_BASE_TIMEOUT = 7000
/**
 * The json contains a lot more fields, but this is the only one we care about
 */
interface IResySlot {
  date: {
    start: string
  }
  config: { type: string }
  seating?: string[]
}

interface IResySlotWithSeating extends IResySlot {
  date: {
    start: string
  }
  seating: string[]
}

interface IResyVenue {
  slots: IResySlot[]
}

interface IResyApiResult {
  results: {
    venues: IResyVenue[]
  }
  query: {
    day: string
    party_size: number
  }
  retryCount?: number
  numRequests?: number
}

/**
 * venue_id is internal to resy, so it would be url_id in our database
 * day is given in yyyy-MM-dd format and is in the restaurant's time zone
 */
const resyUrl = ({
  day,
  party_size,
  venue_id,
}: {
  day: string
  party_size: number
  venue_id: number | string
}) =>
  oneLineTrim`
    https://api.resy.com/4/find?day=${day}&
    lat=0&
    long=0&
    party_size=${party_size}&
    venue_id=${venue_id}
  `

const getResyData = async ({
  business,
  party_size,
  slotTimeRanges,
  useProxy = true,
}: {
  business: IValidResyBusiness
  party_size: number
  slotTimeRanges: ISlotTimeRange[]
  useProxy?: boolean
}) => {
  const slotDates = uniq(map('slots_date', slotTimeRanges))

  const allResults = await pMap(
    slotDates,
    async (slots_date: string) =>
      getResyDataForOneDay({ business, party_size, slots_date, useProxy }).catch((err) => ({
        err,
        business,
        party_size,
        slots_date,
        retryCount: 0,
        numRequests: 0,
      })),
    { concurrency: REQ_CONCURRENCY }
  )

  const errSlotsDates = map(
    'slots_date',
    filter(({ err }: { err?: Error }) => !isEmpty(err), allResults)
  )

  const venues = flatten(compact(map('results.venues', allResults)))
  const slots: IResySlot[] = flatten(compact(map('slots', venues ?? [])))
  const nonErrorSlotTimeRanges = filter(
    ({ slots_date }: { slots_date: string }) => !includes(slots_date, errSlotsDates),
    slotTimeRanges
  )

  return {
    slots,
    actualSlotTimeRanges: isEmpty(errSlotsDates) ? slotTimeRanges : nonErrorSlotTimeRanges,
    retryCount: sum(map('retryCount', allResults)),
    numRequests: sum(map('numRequests', allResults)),
  }
}

/**
 * slots_date is a yyyy-MM-dd formatted string, in the restaurant's timezone
 * The slot time range doesn't matter for resy, since one api call will return all
 * available slots for that day
 */
const getResyDataForOneDay = async ({
  business,
  party_size,
  slots_date,
  useProxy = true,
}: {
  business: IValidResyBusiness
  party_size: number
  slots_date?: string
  useProxy?: boolean
}) => {
  const formattedDay = getDateInTz({ date: slots_date, tz: business.timezone })
  const url = resyUrl({ day: formattedDay, venue_id: business.url_id, party_size })
  let numRequests = 0
  const makeRequest = async () => {
    const responseTimeout = RESY_BASE_TIMEOUT * Math.pow(1.05, retries)
    numRequests += 1
    return resyRequest({
      business,
      url,
      referer: business.url,
      apiKey: true,
      json: true,
      useProxy,
      responseTimeout,
    })
  }

  let retries = 0
  while (retries < MAX_RETRIES) {
    if (await getKillSwitch()) {
      logger.info(`${PLATFORM_NAME}: killswitch activated, exiting now`)
      await prisma.$disconnect()
      process.exit(1)
    }

    logger.debug(`${PLATFORM_NAME}: Requesting for ${url}, retry: ${retries}`, {
      url,
      retries,
      numHandles: (process as any)._getActiveHandles().length,
    })

    if (retries === MAX_RETRIES - 1) {
      const warnMeta = {
        business,
        party_size,
        url,
        retries,
      }
      logger.warn(`${PLATFORM_NAME}: final retry`, warnMeta)
    }

    try {
      const resp = await makeRequest()
      const data = resp.body
      if ((data?.results?.venues?.length ?? 0) === 1) {
        logger.info(`${PLATFORM_NAME}: request succeeded`, { business, party_size, url, retries })
        // If we reached here, we're all good, so we can return the data
        return {
          ...data,
          retryCount: retries,
          numRequests,
        } as IResyApiResult
      }

      if ((data?.results?.venues?.length ?? 0) !== 1) {
        if (data?.results?.venues?.length === 0) {
          logger.warn(
            `${PLATFORM_NAME}: no slot data returned. This restaurant might not be bookable`,
            {
              business,
              data,
              day: data?.query?.day,
              party_size: data?.query?.party_size,
            }
          )
          return { results: { venues: [{ slots: [] }] }, retryCount: 0, numRequests }
        } else {
          throw new FailedServiceError(
            `${PLATFORM_NAME}: slot data does not meet expected format`,
            {
              business,
              data,
            }
          )
        }
      }
    } catch (err: any) {
      const { response } = err
      const errMeta = {
        business,
        party_size,
        slots_date,
        retries,
        response,
        stack: err.stack,
        err,
        numHandles: (process as any)._getActiveHandles().length,
        memoryMB: process.memoryUsage().heapUsed / 1024 / 1024,
      }

      if (response) {
        if (response.statusCode === 419) {
          // 419 is actually unassigned! This is a custom HTTP status from resy
          // see: https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml

          await refreshApiKey(business)
          logger.warn(
            `${PLATFORM_NAME}: request unauthorized, did you forget the api key?`,
            errMeta
          )
        } else if (response.statusCode === 400) {
          // BAD_REQUEST
          // This usually happens if the url_id is invalid
          logger.warn(`${PLATFORM_NAME}: request received bad data, check url_id`, errMeta)
        }
      }

      handleKnownErrors({ PLATFORM_NAME, err, errMeta })
      retries += 1
      continue
    }
  }

  throw new FailedServiceError(`${PLATFORM_NAME}: maximum retries reached`, {
    business,
    slots_date,
    party_size,
  })
}

/**
 * Given a resy API result, returns an array of Dates in UTC time of the available slots
 */
const availableSlotTimesUTC = ({
  slots,
  business,
  slotTimeRanges,
}: {
  slots: IResySlot[]
  business: Business
  slotTimeRanges: ISlotTimeRange[]
}) => {
  if (slots.length === 0) {
    logger.warn(`${PLATFORM_NAME}: No available slots found for this restaurant and time ranges`, {
      business,
      slots,
      slotTimeRanges,
    })
    return []
  }

  return map(
    (slot: IResySlot) => dateFnsTz.zonedTimeToUtc(slot.date.start, business.timezone),
    slots
  )
}

/**
 * Given an array of resy slots (from the api), return an array of slots with seating
 * Also strips out unnecessary fields
 */
const addSeating = (slots: IResySlot[]): IResySlotWithSeating[] => {
  const slotTimeSeatingMapping = groupBy(
    'date',
    map(
      (slot) => ({
        seating: trim(slot.config.type),
        date: slot.date.start,
      }),
      slots
    )
  )

  // This also strips out the unneed fields
  return flow(
    map((slot: IResySlot) => ({
      date: slot.date,
      seating: map('seating', slotTimeSeatingMapping[slot.date.start]) ?? [],
    })),
    compact,
    uniqBy((slot: IResySlot) => slot.date.start)
  )(slots) as IResySlotWithSeating[]
}

/**
 * Given a resy api result object, return all the slot availability information in seated format
 *
 * Includes slots that are unavailable
 * Limits results to specified time range
 * slots_date, slots_start_time, slots_end_time are in the business's timezone
 */
const slotAvailability = ({
  business,
  slots,
  slotTimeRanges,
  humanReadableDate,
}: {
  business: Business
  slots: IResySlotWithSeating[]
  slotTimeRanges: ISlotTimeRange[]
  humanReadableDate?: boolean
}): TSeatedSlotAvailability[] => {
  const slotTimes = allSlotTimes({
    slotTimeRanges,
    interval: business.slot_interval,
    tz: business.timezone,
  })

  const availableTimes = availableSlotTimesUTC({ slots, business, slotTimeRanges })
  const availableTimeStrings = map((date: Date) => date.toISOString(), availableTimes)

  return map((slotTime: Date) => {
    const available = includes(slotTime.toISOString(), availableTimeStrings)
    const seating: string[] = available
      ? slots[findIndex((s) => s === slotTime.toISOString(), availableTimeStrings)]?.seating || []
      : []
    return {
      slot_date: epochMs(slotTime),
      seating,
      available,
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
}

const parseResultsForSeated = ({
  slots,
  business,
  party_size,
  slotTimeRanges,
  humanReadableDate,
}: {
  slots: IResySlotWithSeating[]
  business: Business
  party_size: number
  slotTimeRanges: ISlotTimeRange[]
  humanReadableDate?: boolean
}): TSeatedPayload => {
  const seatedSlots = slotAvailability({
    slots,
    slotTimeRanges,
    business,
    humanReadableDate,
  })

  return {
    business_id: business.external_id,
    business_name: business.name,
    interval: business.slot_interval,
    time_of_check: epochMs(new Date()),
    site_checked: business.platform,
    data: [{ party_size, slots: seatedSlots }],
  }
}

const scrapeAndParse: TScrapeAndParseFn<IValidResyBusiness> = async ({
  business,
  party_size,
  slotTimeRanges,
  humanReadableDate = false,
  useProxy = true,
}: TScrapeAndParseArgs<IValidResyBusiness>) => {
  const res = await getResyData({
    business,
    party_size,
    slotTimeRanges,
    useProxy,
  })

  if (!res) {
    throw new FailedServiceError(`${PLATFORM_NAME}: could not retrieve`, {
      business,
      party_size,
      slotTimeRanges,
    })
  }

  const { slots, actualSlotTimeRanges, retryCount, numRequests } = res

  const slotsWithSeating = addSeating(slots)

  const payload = parseResultsForSeated({
    slots: slotsWithSeating,
    business,
    party_size,
    slotTimeRanges: actualSlotTimeRanges,
    humanReadableDate,
  })

  return { payload, retryCount, numRequests }
}

const getAvailabilityAndParse = getAvailabilityAndParseFactory({
  platform: PLATFORM_NAME,
  scrapeAndParseFn: scrapeAndParse,
})

export {
  addSeating,
  availableSlotTimesUTC,
  getAvailabilityAndParse,
  getResyData,
  parseResultsForSeated,
  scrapeAndParse,
  slotAvailability,
}

export type { IResyApiResult, IResySlot, IResySlotWithSeating }
