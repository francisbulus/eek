import { filter, flatten, map, size } from 'lodash/fp'
import { day_of_week_names, scrape_statuses } from 'prisma-seated'

import { prisma } from '../config/prisma'
import type { TSeatedPayload, TSeatedSlotAvailability } from './seated'
import { formatPayloadToSend } from './seated'

type ISlotData = {
  run_id: number
  party_size: number
  slot_datetime: Date
  availability: boolean
}

// Between 0 and 1, represents the percentage chance
const AUDIT_CHANCE = 0.05

/**
 * Sets the scrape status, payload, and other stuff for the run.
 * Is called before uploading.
 *
 * Note: This also creates individual slots in the slots table, which will be deprecated
 */
const saveSeatedResultsToSlots = async ({
  payload,
  run_id,
  retry_count,
  no_of_requests,
}: {
  payload: TSeatedPayload
  run_id: number
  retry_count?: number
  no_of_requests?: number
}) => {
  const formattedPayload = formatPayloadToSend(payload)
  const { data } = formattedPayload

  const slotData = flatten(
    map(
      ({ party_size, slots }: { party_size: number; slots: TSeatedSlotAvailability[] }) =>
        map(
          ({ slot_date, available }: { slot_date: number; available: boolean }) => ({
            run_id,
            party_size,
            slot_datetime: new Date(slot_date),
            availability: available,
            audit_flag: Boolean(Math.random() <= AUDIT_CHANCE),
          }),
          slots
        ),
      data
    )
  )

  const newSlots = await prisma.slot.createMany({ data: filter('audit_flag', slotData) })

  await updateRun(run_id, slotData, payload, retry_count, no_of_requests)

  return newSlots
}

const saveFutureResultsToOfferedSlots = async ({
  payload,
  run_id,
  business_id,
  check_dow,
  check_time,
  party_size,
  retry_count,
  no_of_requests,
}: {
  payload: TSeatedPayload
  run_id: number
  business_id: number
  check_dow: day_of_week_names
  check_time: string
  party_size: number
  retry_count?: number
  no_of_requests?: number
}) => {
  const formattedPayload = formatPayloadToSend(payload)
  const { data } = formattedPayload

  const slotData = flatten(
    map(
      ({ party_size, slots }: { party_size: number; slots: TSeatedSlotAvailability[] }) =>
        map(
          ({ slot_date, available }: { slot_date: number; available: boolean }) => ({
            business_id,
            check_dow,
            check_time,
            run_id,
            party_size,
            slot_datetime: new Date(slot_date),
            availability: available,
          }),
          slots
        ),
      data
    )
  )

  // delete the older data
  await prisma.offeredSlot.updateMany({
    where: {
      business_id,
      check_dow,
      check_time,
      party_size,
    },
    data: {
      deleted_at: new Date(),
    },
  })

  // create new offered slot data
  const newSlots = await prisma.offeredSlot.createMany({ data: slotData })

  await updateRun(run_id, slotData, payload, retry_count, no_of_requests)

  return newSlots
}

const updateRun = async (
  run_id: number,
  slotData: ISlotData[],
  payload: TSeatedPayload,
  retry_count?: number,
  no_of_requests?: number
) => {
  const existing = await prisma.run.findUnique({
    where: { id: run_id },
  })

  if (!existing) throw new Error(`Run not found: ${run_id}`)

  const actual_num_slots = slotData.length
  const scrape_status =
    actual_num_slots === existing.expected_num_slots
      ? scrape_statuses.success
      : scrape_statuses.done_incomplete

  const available_num_slots = size(filter({ availability: true }, slotData))

  await prisma.run.update({
    where: {
      id: run_id,
    },
    data: {
      scrape_status,
      payload,
      full_payload: payload,
      ended_at: new Date(),
      actual_num_slots,
      available_num_slots,
      retry_count,
      no_of_requests,
    },
  })
}

export { saveFutureResultsToOfferedSlots, saveSeatedResultsToSlots }
