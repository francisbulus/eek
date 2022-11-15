import logger from '@invisible/logger'
import pMap from 'p-map'
import pSleep from 'p-sleep'
import type { Run } from 'prisma-seated'
import { Prisma, scrape_statuses, upload_statuses } from 'prisma-seated'
import superagent from 'superagent'

import { SEATED_API_KEY, SEATED_API_URL } from '../config/env'
import { prisma } from '../config/prisma'

type TSeatedSlotAvailability = {
  /**
   * epoch milliseconds, in utc
   */
  slot_date: number
  available: boolean
  humanReadableDate?: string // For testing purposes only, don't actually send to seated
  seating?: string[]
  offered_slot?: boolean
}

type TSeatedPayloadDatum = { party_size: number; slots: TSeatedSlotAvailability[] }

type TSeatedPayload = {
  business_id: number
  business_name: string
  interval: number
  time_of_check: number // unix time
  site_checked: string
  data: TSeatedPayloadDatum[]
}

const MAX_RETRIES = 10
const SLEEP_MS = 10000
const CONCURRENCY = 20

const sendResults = async (payload: TSeatedPayload) => {
  logger.debug(`Sending to seated: ${SEATED_API_URL}`, payload)
  try {
    const ret = await superagent
      .post(SEATED_API_URL)
      .accept('json')
      .set('invisible-api-key', SEATED_API_KEY)
      .send(payload)
    return ret
  } catch (err: any) {
    const { response } = err
    if (response?.statusCode && response.statusCode === 404) {
      logger.warn(`404 when sending to seated`, { err, payload })
    } else {
      logger.error(err, { err, payload })
      throw err
    }
  }
  return
}

const formatPayloadToSend = (payload: TSeatedPayload): TSeatedPayload => {
  const modPayload = {
    ...payload,
  }
  modPayload.data = payload.data.map((data) => {
    return {
      ...data,
      slots: data.slots.map((slot) => {
        return {
          slot_date: slot.slot_date,
          available: slot.available,
          offered_slot: slot.offered_slot,
        }
      }),
    }
  })
  return modPayload
}

const sendAndUpdate = async ({ payload, run }: { payload: TSeatedPayload; run: Run }) => {
  let retries = 0

  while (retries < MAX_RETRIES) {
    const payloadToSend = formatPayloadToSend(payload)
    try {
      await sendResults(payloadToSend)
      return prisma.run.update({
        where: { id: run.id },
        data: {
          full_payload: payload,
          payload: payloadToSend,
          upload_status: upload_statuses.success,
          uploaded_at: new Date(),
          ended_at: new Date(),
        },
      })
    } catch (err: any) {
      logger.warn(`Seated upload failed, retrying`, {
        run,
        payload,
        err,
        stack: err.stack,
        retries,
      })

      // Payload is set here. It will be overwritten on the next retry
      // But, if upload retries max out, payload will still be set
      // Might cause weird behavior when scrape_status is done_incomplete
      // since we do logic on the payload, but this should be fine.
      await prisma.run.update({
        where: { id: run.id },
        data: {
          full_payload: payload,
          payload: payloadToSend,
          upload_status: upload_statuses.failure,
          uploaded_at: null,
          upload_error: `${err.message} ${err.stack}`,
          ended_at: new Date(),
        },
      })
      retries += 1
      await pSleep(SLEEP_MS)
      continue
    }
  }

  if (retries >= MAX_RETRIES) {
    logger.error(`Seated upload failed, max retries reached`, { run, payload })
  }
  return
}

const resendFailed = async () => {
  const failed = await prisma.run.findMany({
    where: {
      scrape_status: { in: [scrape_statuses.success, scrape_statuses.done_incomplete] },
      upload_status: upload_statuses.failure,
      payload: { not: Prisma.DbNull },
    },
  })

  logger.info(`Num failed uploads: ${failed.length}`)

  return pMap(
    failed,
    async (r: Run) => {
      logger.info(`Resending results for run: ${r.id}`)
      await sendAndUpdate({ run: r, payload: r.payload as TSeatedPayload })
      return r.id
    },
    {
      concurrency: CONCURRENCY,
    }
  )
}

export { formatPayloadToSend, resendFailed, sendAndUpdate, sendResults }
export type { TSeatedPayload, TSeatedPayloadDatum, TSeatedSlotAvailability }
