import logger from '@invisible/logger'
import { oneLineTrim } from 'common-tags'
import * as dateFns from 'date-fns'
import {
  filter,
  findIndex,
  flatten,
  flow,
  groupBy,
  includes,
  isEmpty,
  last,
  map,
  pick,
  sortBy,
  sum,
  uniq,
  values,
} from 'lodash/fp'
import pMap from 'p-map'
import pSleep from 'p-sleep'

import { FailedServiceError } from '../../../../helpers/errors'
import { prisma } from '../../config/prisma'
import {
  addMinutesString,
  epochMs,
  flexibleIsBefore,
  flexibleIsBeforeOrEqual,
  formatInTimeZone,
  parseAsUTC,
} from '../../helpers/date'
import { handleKnownErrors } from '../../helpers/errors'
import { getKillSwitch } from '../../helpers/killSwitch'
import { getAvailabilityAndParseFactory } from '../../helpers/scrape'
import type { TSeatedSlotAvailability } from '../../helpers/seated'
import { allSlotTimes } from '../../helpers/slot'
import type {
  ISlotTimeRange,
  IValidSevenroomsBusiness,
  TScrapeAndParseArgs,
  TScrapeAndParseFn,
} from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'
import { sevenroomsRequest } from './request'

const PLATFORM_NAME = PLATFORMS.SEVENROOMS
const REQ_CONCURRENCY = 10
const MAX_RETRIES = 20
const SEVENROOMS_RETRY_SLEEP_MS = 3000
const SEVENROOMS_INIT_DEADLINE = 60000
const SEVENROOMS_INIT_RESPONSE = 20000

interface ISevenroomsApiResult {
  data: {
    availability: {
      [k: string]: ISevenroomsShift[]
    }
  }
  retryCount?: number
  numRequests?: number
}

interface ISevenroomsShift {
  times: ISevenroomsTime[]
}

interface ISevenroomsTime {
  utc_datetime: string
  seating?: string[]
}

/**
 * Generates a URL for the severooms API
 * Example: https://www.sevenrooms.com/api-yoa/availability/widget/range?venue=negrilbk&time_slot=18:30&party_size=2&halo_size_interval=16&start_date=07-22-2021&num_days=3&channel=SEVENROOMS_WIDGET
 *
 * time is in HH:mm format
 * start_date is in MM-dd-yyyy format
 * All times are in the restaurant's time zone
 */
const sevenroomsUrl = ({
  venue,
  time_slot,
  party_size,
  start_date,
  num_days = 1,
}: {
  venue: string
  time_slot: string
  party_size: number
  start_date: string
  num_days?: number
}) =>
  oneLineTrim`
    https://www.sevenrooms.com/api-yoa/availability/widget/range?
    venue=${venue}&
    time_slot=${time_slot}&
    party_size=${party_size}&
    halo_size_interval=16&
    start_date=${start_date}&
    num_days=${num_days ?? 1}&
    channel=SEVENROOMS_WIDGET
  `

const getSevenroomsData = async ({
  business,
  party_size,
  slotTimeRanges,
  useProxy = true,
}: {
  business: IValidSevenroomsBusiness
  party_size: number
  slotTimeRanges: ISlotTimeRange[]
  useProxy?: boolean
}): Promise<{
  times: ISevenroomsTime[]
  actualSlotTimeRanges: ISlotTimeRange[]
  retryCount: number
  numRequests: number
}> => {
  const allResults = await pMap(
    slotTimeRanges,
    async (slot_time_range: ISlotTimeRange) =>
      getSevenroomsDataForOneRange({ business, party_size, slot_time_range, useProxy }).catch(
        (err) => ({
          err,
          business,
          party_size,
          slot_time_range,
          retryCount: 0,
          numRequests: 0,
        })
      ),
    { concurrency: REQ_CONCURRENCY }
  )

  const errResults = filter(({ err }: { err?: Error }) => !isEmpty(err), allResults)

  const nonErrResults = filter(
    ({ err }: { err?: Error }) => isEmpty(err),
    allResults
  ) as ISevenroomsApiResult[][]

  const allAvailability = flow(flatten, map('data.availability'), values, flatten)(nonErrResults)

  const errSlotTimeRanges = map('slot_time_range', errResults)

  const nonErrorSlotTimeRanges = filter(
    (slot_time_range) => !includes(slot_time_range, errSlotTimeRanges),
    slotTimeRanges
  )

  // This looks crazy but it works
  const times = flow(
    map(values),
    flatten,
    flatten,
    map('times'),
    flatten,
    filter({ type: 'book' }),
    filter((a: ISevenroomsTime) => Boolean(a.utc_datetime)),
    map(pick(['type', 'utc_datetime', 'time_iso', 'public_description_title']))
  )(allAvailability) as ISevenroomsTime[]

  const timesWithSeating = addSeating(times)

  return {
    times: timesWithSeating,
    actualSlotTimeRanges: nonErrorSlotTimeRanges,
    retryCount: sum(map((result) => sum(map('retryCount', result)), allResults)) ?? 0,
    numRequests: sum(map((result) => sum(map('numRequests', result)), allResults)) ?? 0,
  }
}

/**
 * slots_date is a yyyy-MM-dd formatted string, in the restaurant's timezone
 * slots_start_time is a HH:mm formatted string, in the restaurant's timezone
 * slots_end_time is a HH:mm formatted string, in the restaurant's timezone
 */
const getSevenroomsDataForOneRange = async ({
  business,
  party_size,
  slot_time_range,
  useProxy = true,
}: {
  business: IValidSevenroomsBusiness
  party_size: number
  slot_time_range: ISlotTimeRange
  useProxy?: boolean
}): Promise<ISevenroomsApiResult[]> => {
  const { slots_date, slots_start_time, slots_end_time } = slot_time_range

  const responses: ISevenroomsApiResult[] = []

  let resp
  let time_slot = slots_start_time

  const isValidResponse = (r?: ISevenroomsApiResult) =>
    Boolean(r && (r?.data?.availability?.[slots_date]?.length ?? 0) > 0)

  let retries = 0
  let numRequests = 0

  // API returns empty results for seemingly random times,
  // We use a while loop to keep checking for the next valid time slot
  // whenever we encounter one of those
  const incrementDeadlineTimeout = 20000
  do {
    if (await getKillSwitch()) {
      logger.info(`${PLATFORM_NAME}: killswitch activated, exiting now`)
      await prisma.$disconnect()
      process.exit(1)
    }

    if (time_slot === '00:00') break

    const url = sevenroomsUrl({
      venue: business.url_id,
      party_size,
      num_days: 1,
      start_date: slots_date,
      time_slot,
    })

    const makeRequest = async () => {
      numRequests += 1
      return sevenroomsRequest({
        url,
        referer: business.url,
        json: true,
        useProxy,
        deadlineTimeout: SEVENROOMS_INIT_DEADLINE + incrementDeadlineTimeout * retries,
        responseTimeout: SEVENROOMS_INIT_RESPONSE + incrementDeadlineTimeout * retries,
      })
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
      resp = await makeRequest()

      if (isValidResponse(resp.body)) {
        logger.info(`${PLATFORM_NAME}: request succeeded`, { business, party_size, url, retries })
        responses.push({
          data: resp.body.data,
          retryCount: retries,
          numRequests,
        })
        // This includes times marked as "request" cuz that indicates that it was covered in the query
        const newTimes = flatten(map('times', resp.body.data.availability[slots_date]))

        if (!isEmpty(newTimes)) {
          const lastTime = dateFns.format(
            dateFns.parse(
              last(sortBy('time_iso', newTimes))?.time_iso ?? `${slots_date} ${time_slot}:00`,
              'yyyy-MM-dd HH:mm:ss',
              new Date()
            ),
            'HH:mm'
          )
          if (
            lastTime &&
            flexibleIsBefore(`${slots_date} ${time_slot}`, `${slots_date} ${lastTime}`)
          ) {
            time_slot = addMinutesString(lastTime, business.slot_interval)
          } else {
            time_slot = addMinutesString(time_slot, business.slot_interval)
          }
        } else {
          time_slot = addMinutesString(time_slot, business.slot_interval)
        }

        await pSleep(Math.random() * SEVENROOMS_RETRY_SLEEP_MS)
        continue
      } else {
        time_slot = addMinutesString(time_slot, business.slot_interval)
        await pSleep(Math.random() * SEVENROOMS_RETRY_SLEEP_MS)
        continue
      }
    } catch (err: any) {
      const { response } = err
      const errMeta = {
        business,
        slot_time_range,
        party_size,
        retries,
        response,
        stack: err.stack,
        err,
        numHandles: (process as any)._getActiveHandles().length,
        memoryMB: process.memoryUsage().heapUsed / 1024 / 1024,
      }

      if (response?.statusCode === 500) {
        // This usually happens if the url_id is invalid
        throw new FailedServiceError(
          `${PLATFORM_NAME}: request received bad data, check url_id`,
          errMeta
        )
      }

      handleKnownErrors({ PLATFORM_NAME, err, errMeta })

      retries += 1
      continue
    }
  } while (
    flexibleIsBeforeOrEqual(`${slots_date} ${time_slot}`, `${slots_date} ${slots_end_time}`) &&
    retries < MAX_RETRIES
  )

  if (retries >= MAX_RETRIES) {
    throw new FailedServiceError(`${PLATFORM_NAME}: maximum retries reached`, {
      business,
      party_size,
      slot_time_range,
    })
  }

  if (!isEmpty(responses)) {
    return responses
  } else {
    logger.warn(`${PLATFORM_NAME}: No available slots found for this date and party size`, {
      business,
      party_size,
      slot_time_range,
    })
    return [{ data: { availability: { [slots_date]: [{ times: [] }] } } }]
  }
}

/**
 * Given a Sevenrooms API result, return an array of dates (in UTC) of all the available slots
 */
const availableSlotTimesUTC = ({
  times,
  business,
  slotTimeRanges,
}: {
  times: ISevenroomsTime[]
  business: IValidSevenroomsBusiness
  slotTimeRanges: ISlotTimeRange[]
}) => {
  if (isEmpty(times)) {
    logger.warn(`${PLATFORM_NAME}: No available slots found for this date and party size`, {
      times,
      business,
      slotTimeRanges,
    })
    // log it, but don't throw
    return []
  }

  return map((time: ISevenroomsTime) => parseAsUTC(time.utc_datetime), times)
}

/**
 * Given a sevenrooms api result object, return all the slot availability information in seated format
 *
 * Includes slots that are unavailable
 * Limits results to specified time range
 * slots_date, slots_start_time, slots_end_time are in the business's timezone
 */
const slotAvailability = ({
  business,
  times,
  slotTimeRanges,
  humanReadableDate,
}: {
  business: IValidSevenroomsBusiness
  times: ISevenroomsTime[]
  slotTimeRanges: ISlotTimeRange[]
  humanReadableDate?: boolean
}): TSeatedSlotAvailability[] => {
  const slotTimes = allSlotTimes({
    slotTimeRanges,
    interval: business.slot_interval,
    tz: business.timezone,
  })

  const availableTimes = availableSlotTimesUTC({ times, business, slotTimeRanges })
  const availableTimeStrings = map((date: Date) => date.toISOString(), availableTimes)
  return map((slotTime: Date) => {
    const available = includes(slotTime.toISOString(), availableTimeStrings)
    const seating: string[] = available
      ? times[findIndex((s) => s === slotTime.toISOString(), availableTimeStrings)]?.seating || []
      : []
    return {
      slot_date: epochMs(slotTime),
      available: includes(slotTime.toISOString(), availableTimeStrings),
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
  }, slotTimes)
}

const addSeating = (times: ISevenroomsTime[]): ISevenroomsTime[] => {
  return map((key: any) => {
    return {
      utc_datetime: key[0].utc_datetime,
      time_iso: key[0].time_iso,
      type: key[0].time_iso,
      seating: uniq(map('public_description_title', key)),
    }
  }, groupBy('utc_datetime', times))
}

const scrapeAndParse: TScrapeAndParseFn<IValidSevenroomsBusiness> = async ({
  business,
  party_size,
  slotTimeRanges,
  humanReadableDate = false,
  useProxy = true,
}: TScrapeAndParseArgs<IValidSevenroomsBusiness>) => {
  const { times, actualSlotTimeRanges, retryCount, numRequests } = await getSevenroomsData({
    business,
    party_size,
    slotTimeRanges,
    useProxy,
  })

  const slots = slotAvailability({
    times,
    business,
    slotTimeRanges: actualSlotTimeRanges,
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
  availableSlotTimesUTC,
  getAvailabilityAndParse,
  getSevenroomsData,
  getSevenroomsDataForOneRange,
  sevenroomsUrl,
  slotAvailability,
}

export type { ISevenroomsApiResult, ISevenroomsTime }
