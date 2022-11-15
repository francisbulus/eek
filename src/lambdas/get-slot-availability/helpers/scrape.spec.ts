import { expect } from 'chai'
import * as dateFns from 'date-fns'
import { forEach, map } from 'lodash/fp'
import { day_of_week_names } from 'prisma-seated'

import { prisma } from '../config/prisma'
import { epochMs } from './date'
import { checkOfferedSlots } from './scrape'

const setup = async () => {
  const check_time = '09:00'
  const check_dow: day_of_week_names = 'friday'
  const cohort_id = 4
  const cohort_external_id = 4

  const batch = await prisma.batch.create({
    data: {
      check_date: new Date(),
      check_time,
      check_dow,
      cohort_id,
      cohort_external_id,
      num_businesses: 1,
      slots_per_run: 20,
      num_party_sizes: 2,
      expected_num_slots: 40,
    },
  })

  const business = await prisma.business.findFirst({
    where: { cohort_external_id, archived_at: null, timezone: 'America/New_York' },
    orderBy: { id: 'desc' },
  })
  const offeredSlots = [
    { slot_check_day: 'friday' as day_of_week_names, slot_check_time: '10:00', is_available: true },
    { slot_check_day: 'friday' as day_of_week_names, slot_check_time: '10:15', is_available: true },
    {
      slot_check_day: 'friday' as day_of_week_names,
      slot_check_time: '10:30',
      is_available: false,
    },
    {
      slot_check_day: 'friday' as day_of_week_names,
      slot_check_time: '10:45',
      is_available: false,
    },
  ]
  forEach(async (offeredSlot) => {
    await prisma.weeklyOfferedSlot.upsert({
      create: {
        business_external_id: business!.external_id,
        party_size: 2,
        slot_check_day: offeredSlot.slot_check_day,
        slot_check_time: offeredSlot.slot_check_time,
        check_days: 10,
        check_slots: 20,
        is_available: offeredSlot.is_available,
      },
      where: {
        business_external_id_party_size_slot_check_day_slot_check_time: {
          business_external_id: business!.external_id,
          party_size: 2,
          slot_check_day: offeredSlot.slot_check_day,
          slot_check_time: offeredSlot.slot_check_time,
        },
      },
      update: {
        is_available: offeredSlot.is_available,
      },
    })
  }, offeredSlots)

  return {
    batch,
    business,
    check_dow,
    check_time,
  }
}
describe('scrapeSite', () => {
  it('should checkOfferedSlots', async () => {
    const { business } = await setup()
    const slotTimes = ['10:00', '10:15', '10:30', '10:45']
    const slotDates = map((s) => epochMs(new Date(`2022-04-15 ${s}:00-0400`)), slotTimes)
    const party_size = 2

    const payload = {
      business_id: business!.id,
      business_name: business!.name,
      interval: 15,
      time_of_check: dateFns.getUnixTime(new Date('2022-04-13 10:00:00-0400')) * 1000,
      site_checked: business!.platform,
      data: [
        {
          party_size,
          slots: [
            {
              slot_date: slotDates[0],
              available: true,
            },
            {
              slot_date: slotDates[1],
              available: false,
            },
            {
              slot_date: slotDates[2],
              available: true,
            },
            {
              slot_date: slotDates[3],
              available: false,
            },
          ],
        },
      ],
    }

    const expectedData = [
      {
        party_size,
        slots: [
          {
            slot_date: slotDates[0],
            available: true,
            offered_slot: true,
          },
          {
            slot_date: slotDates[1],
            available: false,
            offered_slot: true,
          },
          {
            slot_date: slotDates[2],
            available: true,
            offered_slot: true,
          },
          {
            slot_date: slotDates[3],
            available: false,
            offered_slot: false,
          },
        ],
      },
    ]
    await checkOfferedSlots({
      payload,
      party_size,
      business_external_id: business!.external_id,
      timezone: business!.timezone,
    })
    expect(payload.data).to.be.deep.eq(expectedData)
  })
})
