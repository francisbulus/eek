import logger from '@invisible/logger'
import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'
import {
  compact,
  each,
  filter,
  flatten,
  includes,
  isEmpty,
  map,
  mapKeys,
  reduce,
  shuffle,
  size,
  toPairs,
  values,
} from 'lodash/fp'
import pMap from 'p-map'
import pSleep from 'p-sleep'
import type { Business } from 'prisma-seated'

import { prisma } from '../../config/prisma'
import { epochMs, formatInTimeZone, makeTimeRange } from '../../helpers/date'
import { handleKnownErrors } from '../../helpers/errors'
import { getKillSwitch } from '../../helpers/killSwitch'
import { getAvailabilityAndParseFactory } from '../../helpers/scrape'
import type { TSeatedPayload } from '../../helpers/seated'
import { allSlotTimes, getSlotTimes } from '../../helpers/slot'
import type {
  ISlotTimeRange,
  IValidOpentableBusiness,
  TScrapeAndParseArgs,
  TScrapeAndParseFn,
  TSlotTimesOrRanges,
} from '../../helpers/types'
import { opentableApiKeyAndCookies } from './apiKey'
import { opentableRequest } from './request'

const PLATFORM_NAME = 'opentable'
const OPENTABLE_URL = 'https://www.opentable.com/restref/api/availability?lang=en-US'
const OPENTABLE_RETRY_SLEEP_MS = 8000
const OPENTABLE_RETRY_MIN_SLEEP_MS = 2000
const OPENTABLE_BASE_TIMEOUT = 7000
const MAX_RETRIES = 20
const REQ_CONCURRENCY = 7

/*
 * The json contains a lot more fields, but this is the only one we care about
 */
interface IOpentableSlot {
  dateTime: string
  tableAttributes?: string[]
}

interface IOpentableApiResult {
  availability: {
    [key: string]: {
      timeSlots?: IOpentableSlot[]
      reasonCode?: string
      message?: string
    }
  }
  sameDayAvailability?: {
    noTimesMessage: string
  }
}

interface ISlotsObj extends Record<string, boolean | null> {}

interface ISlotsObjWithSeating extends Record<string, string[] | null> {}

/**
 * Given an Opentable API result, return true if there is no availability within 2.5 hours
 */
const noAvailability = ({
  data,
  dateString, //yyyy-MM-dd
}: {
  data?: IOpentableApiResult
  dateString: string
}) =>
  Boolean(
    (!data?.availability &&
      includes(
        'no online availability within 2.5 hours',
        data?.sameDayAvailability?.noTimesMessage
      )) ||
      data?.availability?.[dateString]?.reasonCode === 'NoTimesExist' ||
      data?.availability?.[dateString]?.reasonCode === 'NotActive'
  )

/**
 * Given an Opentable API result, return true if not on the OpenTable reservation network
 */
const noService = (data?: IOpentableApiResult) => {
  return Boolean(
    data?.availability &&
      'error' in data?.availability &&
      data?.availability['error']['message'] === 'NOT_AVAILABLE'
  )
}

/**
 * Given an Opentable API result, return true if the requested party size is above the max offered.
 *
 * Date is in yyyy-MM-dd format
 */
const aboveMaxPartySize = ({
  data,
  dateString,
}: {
  data?: IOpentableApiResult
  dateString: string
}) => Boolean(data?.availability?.[dateString]?.reasonCode === 'AboveMaxPartySize')

const otFormat = ({ dateTime, business }: { dateTime: Date; business: Business }) =>
  formatInTimeZone({ date: dateTime, tz: business.timezone, fmt: `yyyy-MM-dd'T'HH:mm` })

/**
 * Given a dateTime, mark all slots within 2.5h (before and after) as unavailable in the slotsObj
 */
const markUnavailable = ({
  dateTime,
  business,
  slotsObj,
}: {
  dateTime: Date
  business: Business
  slotsObj: ISlotsObj
}) => {
  const timesToMarkArgs = {
    date: formatInTimeZone({ date: dateTime, tz: business.timezone, fmt: 'yyyy-MM-dd' }),
    start: formatInTimeZone({
      date: dateFns.addMinutes(dateTime, -2.5 * 60),
      tz: business.timezone,
      fmt: 'HH:mm',
    }),
    end: formatInTimeZone({
      date: dateFns.addMinutes(dateTime, 2.5 * 60),
      tz: business.timezone,
      fmt: 'HH:mm',
    }),
    interval: business.slot_interval,
    tz: business.timezone,
  }
  const timesToMark = makeTimeRange(timesToMarkArgs)
  each((t: Date) => {
    const k = otFormat({ dateTime: t, business })
    if (slotsObj[k] === null || slotsObj[k] === undefined) {
      slotsObj[k] = false
    }
  }, timesToMark)
}

/**
 * Mark all times as unavailable in the slotsObj
 *
 * Note: currently this is only used if the party size is above maximum offered
 */
const markAllUnavailable = ({
  slotsObj,
  slotTimes,
  business,
}: {
  slotsObj: ISlotsObj
  slotTimes: Date[]
  business: Business
}) => {
  each((t: Date) => {
    const k = otFormat({ dateTime: t, business })
    slotsObj[k] = false
  }, slotTimes)
}

/**
 * Retrieve the api results from Opentable for the given business, party_size, and slot times
 */
const getOpentableData = async ({
  business,
  party_size,
  slotTimeRanges,
  slotTimeOverrides,
  useProxy = true,
}: {
  business: IValidOpentableBusiness
  party_size: number
  useProxy?: boolean
} & TSlotTimesOrRanges) => {
  const slotTimes = getSlotTimes({ business, slotTimeRanges, slotTimeOverrides })

  const slotsObj: ISlotsObj = reduce(
    (acc, t: Date) => ({ ...acc, [otFormat({ dateTime: t, business })]: null }),
    {},
    slotTimes
  )

  const slotsObjWithSeating: ISlotsObjWithSeating = reduce(
    (acc, t: Date) => ({ ...acc, [otFormat({ dateTime: t, business })]: [] }),
    {},
    slotTimes
  )

  let numNullSlots = size(filter((x) => x === null, values(slotsObj)))
  let numRequests = 0
  let retries = 0
  const getOpentableDataForOneSlot = async (dateTime: Date) => {
    const otFormatted = otFormat({ dateTime, business })

    numNullSlots = size(filter((x) => x === null, values(slotsObj)))

    if (slotsObj[otFormatted] !== null) {
      // We scraped this slot already, so we can skip it
      return
    }

    if (numNullSlots === 0) {
      logger.debug(`All slots already found, skipping`)
      return
    }

    // We handle retries per time slot requested
    const makeRequest = async () => {
      if (slotsObj[otFormatted] !== null) {
        // We scraped this slot already, so we can skip it
        return true
      }

      numNullSlots = size(filter((x) => x === null, values(slotsObj)))
      if (numNullSlots === 0) {
        logger.debug(`All slots already found, skipping`)
        return true
      }
      numRequests += 1
      const sessionId = `${Math.floor(Math.random() * 999999)}`
      const { apiKey, cookie } = await opentableApiKeyAndCookies({ business, sessionId })

      const body = {
        partySize: party_size,
        rid: business.url_id,
        dateTime: otFormatted,
      }

      const sleepMs =
        Math.random() * (1 + (1.0 * retries) / MAX_RETRIES) * OPENTABLE_RETRY_SLEEP_MS +
        OPENTABLE_RETRY_MIN_SLEEP_MS

      const responseTimeout = OPENTABLE_BASE_TIMEOUT * Math.pow(1.05, retries)
      await pSleep(sleepMs)

      logger.debug(`${PLATFORM_NAME}: slept for ${sleepMs}, making post`, { body })

      return opentableRequest({
        url: OPENTABLE_URL,
        referer: business.url,
        method: 'POST',
        body,
        apiKey,
        cookie,
        useProxy,
        sessionId,
        responseTimeout,
      })
    }

    while (retries < MAX_RETRIES) {
      if (await getKillSwitch()) {
        logger.info(`${PLATFORM_NAME}: killswitch activated, exiting now`)
        await prisma.$disconnect()
        process.exit(1)
      }

      logger.debug(`${PLATFORM_NAME}: Requesting for ${otFormatted}, retry: ${retries}`, {
        otFormatted,
        retries,
        numHandles: (process as any)._getActiveHandles().length,
      })
      try {
        const resp = await makeRequest()
        if (resp === true) {
          // logger.debug(`slot already exists, skipping`)
          return
        }

        const data: IOpentableApiResult = resp.body

        const dateString = formatInTimeZone({
          date: dateTime,
          tz: business.timezone,
          fmt: `yyyy-MM-dd`,
        })

        if (noService(data)) {
          logger.debug(
            `${PLATFORM_NAME}: restaurant is not on the OpenTable reservation network`,
            {}
          )
          markAllUnavailable({ slotsObj, slotTimes, business })
          return
        }

        if (noAvailability({ data, dateString })) {
          logger.debug(
            `${PLATFORM_NAME}: we can mark availability false within 2.5 hours of ${otFormatted}`,
            {}
          )
          markUnavailable({ dateTime, slotsObj, business })
        }

        if (aboveMaxPartySize({ data, dateString })) {
          logger.debug(
            `${PLATFORM_NAME}: this restaurant does not accept reservations for this party size`,
            {
              business,
              party_size,
              otFormatted,
            }
          )
          markAllUnavailable({ slotsObj, slotTimes, business })
          return
        }

        logger.info(`${PLATFORM_NAME}: request succeeded`, { business, otFormatted, retries })

        const newSlots = flatten(compact(map('timeSlots', values(data?.availability ?? {}) ?? [])))

        each((newSlot) => {
          slotsObj[newSlot.dateTime] = true
          slotsObjWithSeating[newSlot.dateTime] = newSlot.tableAttributes || []
        }, newSlots)

        if (slotsObj[otFormatted] === null) {
          slotsObj[otFormatted] = false
          slotsObjWithSeating[otFormatted] = []
        }
        return
      } catch (err: any) {
        const { response } = err
        const errMeta = {
          business,
          otFormatted,
          party_size,
          slotTimeRanges,
          slotTimeOverrides,
          retries,
          response,
          stack: err.stack,
          err,
          numHandles: (process as any)._getActiveHandles().length,
          memoryMB: process.memoryUsage().heapUsed / 1024 / 1024,
        }

        handleKnownErrors({ PLATFORM_NAME, err, errMeta })

        const sleepMs = Math.random() * OPENTABLE_RETRY_SLEEP_MS + OPENTABLE_RETRY_MIN_SLEEP_MS
        logger.info(`${PLATFORM_NAME}: Sleeping for ${sleepMs}`)
        await pSleep(sleepMs)

        retries += 1
      }
    }

    if (retries >= MAX_RETRIES) {
      logger.error(`${PLATFORM_NAME}: maximum retries reached`, {
        business,
        otFormatted,
        party_size,
      })
    }
  }

  // We have to make requests for all times in the range as opentable only returns very limited availability data for each request sent
  await pMap(shuffle(slotTimes), getOpentableDataForOneSlot, { concurrency: REQ_CONCURRENCY })

  return { business, slotsObj, slotsObjWithSeating, numRequests, retryCount: retries }
}

/**
 * Given a opentable api result object, return all the slot availability information in seated format
 *
 * Includes slots that are unavailable
 * Limits results to specified time range
 * slots_date, slots_start_time, slots_end_time are in the business's timezone
 *
 * Note: This works slightly differently from yelp, resy, and sevenrooms in that
 * we have nulls for slots that couldn't be scraped
 */
const slotAvailability = ({
  business,
  humanReadableDate,
  slotsObj,
  slotsObjWithSeating,
  slotTimeRanges,
}: {
  business: Business
  humanReadableDate?: boolean
  slotsObj: Record<string, boolean | null>
  slotsObjWithSeating: ISlotsObjWithSeating
  slotTimeRanges: ISlotTimeRange[]
}) => {
  // Here, we don't need to override the slot times. Why?
  // Because it's possible that getOpentableData scraped some bonus slots that
  // were NOT part of slotTimeOverrides, but are still part of the slots defined by slotTimeRanges.
  //
  // Since newer data should override older data, we'll allow this when combining our payloads
  const slotTimes = allSlotTimes({
    slotTimeRanges,
    interval: business.slot_interval,
    tz: business.timezone,
  })

  const slotsInUtc = mapKeys(
    (k: string) => dateFnsTz.zonedTimeToUtc(k, business.timezone).toISOString(),
    slotsObj
  )

  const slotsWithSeatingInUtc = mapKeys(
    (k: string) => dateFnsTz.zonedTimeToUtc(k, business.timezone).toISOString(),
    slotsObjWithSeating
  )

  const nulls = filter((a: [string, boolean | null]) => a[1] === null, toPairs(slotsObj))
  if (!isEmpty(nulls)) {
    logger.error(`${PLATFORM_NAME}: nulls found for at least one slot`, { business, nulls })
  }

  return compact(
    map((slotTime: Date) => {
      if (
        slotsInUtc[slotTime.toISOString()] === null ||
        slotsInUtc[slotTime.toISOString()] === undefined
      ) {
        return undefined
      } else {
        const available = Boolean(slotsInUtc[slotTime.toISOString()])
        const seating: string[] = available
          ? slotsWithSeatingInUtc[slotTime.toISOString()] || []
          : []
        return {
          slot_date: epochMs(slotTime),
          available,
          seating,
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
      }
    }, slotTimes)
  )
}

/**
 * Given a slotsObj, parse the results into the seated payload format
 */
const parseResultsForSeated = ({
  slotsObj,
  slotsObjWithSeating,
  business,
  party_size,
  slotTimeRanges,
  slotTimeOverrides,
  humanReadableDate,
}: {
  slotsObj: Record<string, boolean | null>
  slotsObjWithSeating: ISlotsObjWithSeating
  business: Business
  party_size: number
  humanReadableDate?: boolean
} & TSlotTimesOrRanges): TSeatedPayload => {
  const slots = slotAvailability({
    slotsObj,
    slotsObjWithSeating,
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
    data: [{ party_size, slots }],
  }
}

/**
 * Scrape an opentable restaurant with the given config, and return a seated payload
 */
const scrapeAndParse: TScrapeAndParseFn<IValidOpentableBusiness> = async ({
  business,
  party_size,
  slotTimeRanges,
  slotTimeOverrides,
  humanReadableDate = false,
  useProxy = true,
}: TScrapeAndParseArgs<IValidOpentableBusiness>) => {
  const { slotsObj, slotsObjWithSeating, retryCount, numRequests } = await getOpentableData({
    business,
    party_size,
    slotTimeRanges,
    slotTimeOverrides,
    useProxy,
  })

  const payload = parseResultsForSeated({
    slotsObj,
    slotsObjWithSeating,
    business,
    party_size,
    slotTimeRanges,
    slotTimeOverrides,
    humanReadableDate,
  })

  return { payload, retryCount, numRequests }
}

// DRY'd up!
const getAvailabilityAndParse = getAvailabilityAndParseFactory({
  platform: PLATFORM_NAME,
  scrapeAndParseFn: scrapeAndParse,
})

export {
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
}

export type { IOpentableApiResult, IOpentableSlot, ISlotsObj }
