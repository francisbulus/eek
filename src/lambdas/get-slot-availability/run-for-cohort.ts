import { VercelRequest, VercelResponse } from '@vercel/node'
import { compact, find, flatten, flow, map, shuffle } from 'lodash/fp'
import pMap from 'p-map'
import { performance } from 'perf_hooks'
import type { Business } from 'prisma-seated'
import { day_of_week_names } from 'prisma-seated'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError, initErrorCatcher, ResourceNotFound } from '../../helpers/errors'
import { prisma } from './config/prisma'
import { getLatestCohortForExternalId } from './helpers/cohort'
import { cohortSlotTimes } from './helpers/cohortSchedule'
import type { TSeatedPayload } from './helpers/seated'
import type { TGetAvailabilityAndParseArgs, TPlatform } from './helpers/types'
import { PLATFORMS } from './helpers/types'
import * as opentable from './opentable/helpers/api'
import * as resy from './resy/helpers/api'
import * as sevenrooms from './sevenrooms/helpers/api'
import * as yelp from './yelp/helpers/api'

initErrorCatcher()

const inputYupSchema = yup
  .object({
    cohort_external_id: yup.number().required(),
    check_dow: yup.string().required(),
    check_time: yup.string().required(),
    sendToSeated: yup.boolean(),
    limit: yup.number(),
    test_mode: yup.boolean(),
    external_ids: yup.array(yup.number().required()),
    batch_id: yup.number().required(),
    addDays: yup.number(),
  })
  .required()

const scrapers = [
  { platform: PLATFORMS.OPENTABLE, service: opentable },
  { platform: PLATFORMS.RESY, service: resy },
  { platform: PLATFORMS.SEVENROOMS, service: sevenrooms },
  { platform: PLATFORMS.YELP, service: yelp },
] as const

const genericScraperFn = (platform: TPlatform) => {
  const scraper = find({ platform }, scrapers) as typeof scrapers[number]
  return scraper.service.getAvailabilityAndParse
}

const CONCURRENCY = 10
interface IRunForCohortResult {
  data: (TSeatedPayload | undefined)[]
  summary: {
    batch_id: number
    cohort_external_id: number
    cohort_id: number
    check_dow: day_of_week_names
    check_time: string
    sendToSeated?: boolean
    test_mode?: boolean
    numBusinesses: number
    external_ids?: number[]
    party_sizes: number[]
    interval: number
    totalSeconds: number
    slotsPerRun: number
    totalSlotsChecked: number
    totalSlotsExpected: number
    slotsCheckedEqExpected: boolean
    slotsPerSecond: number
    limit?: number
    addDays?: number
  }
}

const runForCohort = async ({
  batch_id,
  cohort_external_id = 5,
  check_dow,
  check_time,
  sendToSeated = false,
  test_mode = false,
  force = false,
  external_ids,
  limit,
  addDays,
}: {
  batch_id: number
  cohort_external_id: number
  check_dow: day_of_week_names
  check_time: string
  sendToSeated?: boolean
  force?: boolean
  limit?: number
  test_mode?: boolean
  external_ids?: number[]
  addDays?: number
}): Promise<IRunForCohortResult> => {
  const cohort = await getLatestCohortForExternalId(cohort_external_id)
  if (!cohort) {
    throw new ResourceNotFound(`Cohort: ${cohort_external_id}`)
  }
  const cohort_id = cohort.id

  const where = {
    cohort_id: cohort.id,
    ...(external_ids ? { external_id: { in: external_ids } } : {}),
  }

  const businesses = await prisma.business.findMany({
    where,
    ...(limit ? { take: limit } : {}),
    orderBy: [{ id: 'asc' }],
  })

  const { party_sizes } = cohort
  const { slot_times, slotTimeRanges } = await cohortSlotTimes({
    cohort,
    check_dow,
    check_time,
    addDays,
  })

  const argsPerBusiness = (
    party_size: number
  ): (TGetAvailabilityAndParseArgs & { platform: TPlatform })[] =>
    map(
      (biz: Business) => ({
        batch_id,
        platform: biz.platform as TPlatform,
        external_id: biz.external_id,
        party_size,
        slotTimeRanges,
        useProxy: true,
        check_dow,
        check_time,
        sendToSeated,
        test_mode,
        cohort_external_id,
        cohort_id,
        addDays,
      }),
      businesses
    )

  const allArgs: (TGetAvailabilityAndParseArgs & { platform: TPlatform })[] = flow(
    map(argsPerBusiness),
    flatten,
    shuffle
  )(party_sizes)

  const startTime = performance.now()

  const allPayloads = compact(
    await pMap(allArgs, async (args) => genericScraperFn(args.platform)(args), {
      concurrency: CONCURRENCY,
    })
  )

  const endTime = performance.now()

  const totalSlotsChecked = flatten(map('slots', flatten(map('data', allPayloads)))).length
  const totalSlotsExpected = slot_times.length * businesses.length * party_sizes.length

  const totalSeconds = (endTime - startTime) / 1000.0
  const slotsPerSecond = totalSlotsChecked / totalSeconds

  return {
    data: allPayloads,
    summary: {
      batch_id,
      cohort_external_id,
      cohort_id,
      check_dow,
      check_time,
      sendToSeated,
      test_mode,
      numBusinesses: businesses.length,
      external_ids: map('external_id', businesses),
      party_sizes,
      interval: cohort!.slot_interval,
      totalSeconds,
      slotsPerRun: slot_times.length,
      totalSlotsChecked,
      totalSlotsExpected,
      slotsCheckedEqExpected: Boolean(totalSlotsChecked === totalSlotsExpected),
      slotsPerSecond,
      limit,
      addDays,
    },
  }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    const inputData = inputYupSchema.validateSync(req.body.data)

    const outputData = await runForCohort({
      ...inputData,
      check_dow: inputData.check_dow as day_of_week_names,
    })

    prisma.$disconnect()

    res.send({
      data: outputData,
      status: STEP_RUN_STATUSES.DONE,
    })
  } catch (err: any) {
    prisma.$disconnect()
    handleError({ err, req, res })
  }
}

export type { IRunForCohortResult }
