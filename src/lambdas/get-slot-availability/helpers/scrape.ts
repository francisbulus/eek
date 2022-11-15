import logger from '@invisible/logger'
import { find } from 'lodash/fp'
import { scrape_statuses } from 'prisma-seated'

import { prisma } from '../config/prisma'
import { getBusiness } from './business'
import { compareDayWithDateTime, compareTimeWithDateTime } from './date'
import { saveFutureResultsToOfferedSlots, saveSeatedResultsToSlots } from './db'
import { getExistingRunAndPayloadOrCreate, getMissingSlots, mergePayloads } from './run'
import type { TSeatedPayload } from './seated'
import { sendAndUpdate } from './seated'
import type {
  IValidBusiness,
  TGetAvailabilityAndParseArgs,
  TGetAvailabilityAndParseFn,
  TPlatform,
  TScrapeAndParseFn,
} from './types'

const {
  success: SUCCESS,
  processing: PROCESSING,
  done_incomplete: DONE_INCOMPLETE,
  failure: FAILURE,
} = scrape_statuses

/**
 * Given a platform, a valid business type, and a scrape'n'parse function,
 * return a function that will scrape the availability for a given config,
 * parse it, save it to the db, and send it to Seated.
 *
 * This function looks long, but it's really only about 10-15 statements.
 */
const getAvailabilityAndParseFactory = <TValidBusinessSubtype extends IValidBusiness>({
  platform,
  scrapeAndParseFn,
}: {
  platform: TPlatform
  scrapeAndParseFn: TScrapeAndParseFn<TValidBusinessSubtype>
}): TGetAvailabilityAndParseFn => async ({
  batch_id,
  external_id,
  party_size,
  slotTimeRanges,
  check_dow,
  check_time,
  cohort_external_id,
  cohort_id,
  humanReadableDate = false,
  useProxy = true,
  sendToSeated = false,
  test_mode = false,
  force = false,
  addDays,
}: TGetAvailabilityAndParseArgs): Promise<TSeatedPayload | undefined> => {
  const business = (await getBusiness({
    batch_id,
    external_id,
    cohort_external_id,
    platform,
  })) as TValidBusinessSubtype

  const { payload: existingPayload, run, scrape_status } = await getExistingRunAndPayloadOrCreate({
    batch_id,
    business,
    check_dow,
    check_time,
    force,
    party_size,
    slotTimeRanges,
    test_mode,
    platform,
    cohort_id,
    cohort_external_id,
  })

  if (scrape_status === SUCCESS) return existingPayload
  if (scrape_status === PROCESSING) return

  if (!run) throw new Error(`Something wacky happened, run was not created`)
  const run_id = run.id

  // If there are missing slots, pass them into the scraper
  const slotTimeOverrides =
    scrape_status === DONE_INCOMPLETE
      ? await getMissingSlots({
          slotTimeRanges,
          business,
          payload: existingPayload,
          party_size,
        })
      : undefined

  try {
    const { retryCount, numRequests, payload: newPayload } = await scrapeAndParseFn({
      business,
      party_size,
      slotTimeRanges,
      slotTimeOverrides,
      humanReadableDate,
      useProxy,
    })

    logger.info(`Existing payload`, { length: existingPayload?.data[0].slots.length })

    // If we have an existing payload, that means at least one run was done_incomplete.
    // Combine the new payload with the existing one to form the new payload.
    // This assumes that the existing payload is contained within the slotTimeRanges.
    const payload = existingPayload ? mergePayloads(existingPayload!, newPayload) : newPayload

    if (addDays && addDays > 0) {
      await saveFutureResultsToOfferedSlots({
        payload,
        run_id,
        business_id: business.id,
        check_dow,
        check_time,
        party_size,
        retry_count: retryCount,
        no_of_requests: numRequests,
      })
    } else {
      await checkOfferedSlots({
        payload,
        business_external_id: business.external_id,
        party_size,
        timezone: business.timezone,
      })

      await saveSeatedResultsToSlots({
        payload,
        run_id,
        retry_count: retryCount,
        no_of_requests: numRequests,
      })

      if (sendToSeated) await sendAndUpdate({ run: run!, payload })
    }

    return payload
  } catch (err: any) {
    logger.error(err)
    await prisma.run.update({
      where: { id: run_id },
      data: {
        scrape_status: FAILURE,
        scrape_error: `${err.message} ${err.stack}`,
        ended_at: new Date(),
      },
    })
    return
  }
}

const checkOfferedSlots = async ({
  payload,
  business_external_id,
  party_size,
  timezone,
}: {
  payload: TSeatedPayload
  business_external_id: number
  party_size: number
  timezone: string
}) => {
  payload.data = await Promise.all(
    payload.data.map(async (data) => {
      const offeredSlots = await getOfferedSlots({ party_size, business_external_id })
      return {
        ...data,
        slots: data.slots.map((slot) => {
          const offeredSlot = find(
            (s) =>
              compareDayWithDateTime(s.slot_check_day!, new Date(slot.slot_date)) &&
              compareTimeWithDateTime(s.slot_check_time!, new Date(slot.slot_date), timezone),
            offeredSlots
          )
          return {
            ...slot,
            offered_slot: offeredSlot ? offeredSlot.is_available || slot.available : slot.available,
          }
        }),
      }
    })
  )
}

const getOfferedSlots = async ({
  party_size,
  business_external_id,
}: {
  party_size: number
  business_external_id: number
}) => {
  const slots = await prisma.weeklyOfferedSlot.findMany({
    where: {
      business_external_id,
      party_size,
    },
  })
  return slots
}

export { checkOfferedSlots, getAvailabilityAndParseFactory }
