import { expect } from 'chai'
import * as dateFns from 'date-fns'
import { day_of_week_names } from 'prisma-seated'
import sinon from 'sinon'

import { prisma } from '../config/prisma'
import { epochMs, roundTime } from '../helpers/date'
import { getAvailabilityAndParse } from '../opentable/helpers/api'
import { randomOpentableBusinesses } from '../opentable/helpers/randomBusinesses'
import * as DB from './db'
import { formatPayloadToSend, sendResults } from './seated'

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
    where: { cohort_external_id, archived_at: null },
    orderBy: { id: 'desc' },
  })
  const randomRun = await prisma.run.findFirst({
    orderBy: { id: 'desc' },
  })
  await prisma.offeredSlot.createMany({
    data: [
      {
        business_id: business!.id,
        run_id: randomRun!.id,
        check_dow: 'tuesday',
        check_time: '10:00',
        party_size: 2,
        slot_datetime: new Date('2022-01-25 10:00:00-0500'),
        availability: true,
      },
      {
        business_id: business!.id,
        run_id: randomRun!.id,
        check_dow: 'tuesday',
        check_time: '10:00',
        party_size: 2,
        slot_datetime: new Date('2022-01-25 10:15:00-0500'),
        availability: true,
      },
    ],
  })
  return {
    batch,
    business,
  }
}

describe('sendResults', () => {
  it('should send the results to seated', async function () {
    // Note: this test will make an actual network call, so disable it for CI
    if (process.env.CI === 'true') this.skip()

    const now = new Date()

    const slotDate1 = epochMs(roundTime(dateFns.add(now, { hours: 1 })))
    const slotDate2 = epochMs(roundTime(dateFns.add(now, { hours: 1.5 }), 30 * 60 * 1000))

    const payload = {
      business_id: 992,
      business_name: 'La Summa',
      interval: 15,
      time_of_check: dateFns.getUnixTime(now) * 1000,
      site_checked: 'resy',
      data: [
        {
          party_size: 2,
          slots: [
            {
              slot_date: slotDate1,
              available: true,
            },
            {
              slot_date: slotDate2,
              available: false,
            },
          ],
        },
      ],
    }

    try {
      const actual = await sendResults(payload)
      expect(actual!.status).to.eq(200)
    } catch (err: any) {
      console.error(err) // eslint-disable-line no-console
      throw err
    }
  })

  it('should format results before sending to seated', async function () {
    // Note: this test will make an actual network call, so disable it for CI
    if (process.env.CI === 'true') this.skip()
    const { business } = await setup()

    const slotDate1 = epochMs(new Date('2022-01-11 10:00:00-0500'))
    const slotDate2 = epochMs(new Date('2022-01-11 10:15:00-0500'))

    const payload = {
      business_id: business!.id,
      business_name: business!.name,
      interval: 15,
      time_of_check: dateFns.getUnixTime(new Date('2022-01-11 10:00:00-0500')) * 1000,
      site_checked: business!.platform,
      data: [
        {
          party_size: 2,
          slots: [
            {
              slot_date: slotDate1,
              available: true,
              seating: ['default', 'others'],
              offered_slot: true,
            },
            {
              slot_date: slotDate2,
              available: false,
              seating: ['default', 'others'],
              offered_slot: false,
            },
          ],
        },
      ],
    }

    try {
      const payloadToSend = formatPayloadToSend(payload)
      const expectedData = [
        {
          party_size: 2,
          slots: [
            {
              slot_date: slotDate1,
              available: true,
              offered_slot: true,
            },
            {
              slot_date: slotDate2,
              available: false,
              offered_slot: false,
            },
          ],
        },
      ]
      expect(payloadToSend).to.not.eq(payload)
      expect(payloadToSend.data).to.deep.eq(expectedData)
    } catch (err: any) {
      console.error(err) // eslint-disable-line no-console
      throw err
    }
  })

  it('should send data to seated if days added for future is null or 0', async function () {
    if (process.env.CI === 'true') this.skip()

    const business = (await randomOpentableBusinesses())[0]
    const slots_date = dateFns.format(new Date(), 'yyyy-MM-dd')
    const party_size = 4
    const check_time = '09:00'
    const check_dow: day_of_week_names = 'friday'
    const { batch } = await setup()

    const spy = sinon.spy(DB, 'saveSeatedResultsToSlots')

    await getAvailabilityAndParse({
      batch_id: batch.id,
      external_id: business.external_id,
      party_size,
      check_dow,
      cohort_id: batch.cohort_id,
      cohort_external_id: batch.cohort_external_id,
      check_time,
      slotTimeRanges: [
        {
          slots_date,
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
      ],
      useProxy: true,
    })

    expect(spy.called).to.be.true
  })

  it('should save data to offered slots if days added for future is greater than 0', async function () {
    if (process.env.CI === 'true') this.skip()

    const business = (await randomOpentableBusinesses())[0]
    const slots_date = dateFns.format(new Date(), 'yyyy-MM-dd')
    const party_size = 4
    const check_time = '09:00'
    const check_dow: day_of_week_names = 'friday'
    const { batch } = await setup()

    const spy = sinon.spy(DB, 'saveFutureResultsToOfferedSlots')

    await getAvailabilityAndParse({
      batch_id: batch.id,
      external_id: business.external_id,
      party_size,
      check_dow,
      cohort_id: batch.cohort_id,
      cohort_external_id: batch.cohort_external_id,
      check_time,
      slotTimeRanges: [
        {
          slots_date,
          slots_start_time: '17:00',
          slots_end_time: '21:00',
        },
      ],
      useProxy: true,
      addDays: 7,
    })

    expect(spy.called).to.be.true
  })
})
