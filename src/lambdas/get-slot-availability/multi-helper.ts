import logger from '@invisible/logger'
import * as dateFnsTz from 'date-fns-tz'
import {
  chunk,
  compact,
  each,
  filter,
  get,
  isEmpty,
  map,
  max,
  shuffle,
  size,
  sum,
  toLower,
} from 'lodash/fp'
import pMap from 'p-map'
import { performance } from 'perf_hooks'
import { day_of_week_names } from 'prisma-seated'
import superagent from 'superagent'

import { ResourceNotFound } from '../../helpers/errors'
import { AUTOMATIONS_TOKEN, AUTOMATIONS_URL, BUSINESS_PER_FUNCTION } from './config/env'
import { prisma } from './config/prisma'
import { getLatestCohortForExternalId } from './helpers/cohort'
import { cohortSlotTimes } from './helpers/cohortSchedule'
import { formatInTimeZone, roundTime } from './helpers/date'
import { seatedRedisService } from './helpers/redis'
import { resendFailed } from './helpers/seated'
import type { IRunForCohortResult } from './run-for-cohort'

const URL = `${AUTOMATIONS_URL}/api/get-slot-availability/run-for-cohort`

const TIMEOUT_OBJ = {
  response: (15 * 60 + 30) * 1000,
  deadline: (15 * 60 + 30) * 1000,
}

const MAX_RETRIES = 20

const CHECK_TIMEZONE = 'America/New_York'
const CURRENT_CHECK_TIME_INTERVAL = 15 * 60 * 1000

const getCurrentCheckTime = () => {
  const now = new Date()
  const check_dow = toLower(
    dateFnsTz.format(now, 'EEEE', { timeZone: CHECK_TIMEZONE })
  ) as day_of_week_names
  const rounded = roundTime(now, CURRENT_CHECK_TIME_INTERVAL)
  const check_time = formatInTimeZone({ date: rounded, fmt: 'HH:mm', tz: CHECK_TIMEZONE })
  return { check_dow, check_time }
}

interface IArgForOne {
  data: {
    batch_id: number
    cohort_id: number
    cohort_external_id: number
    check_dow: day_of_week_names
    check_time: string
    sendToSeated?: boolean
    test_mode?: boolean
    external_ids?: number[]
    force?: boolean
    addDays?: number
  }
}

const runMulti = async ({
  cohort_external_id = 5,
  check_dow,
  check_time,
  sendToSeated = false,
  limit,
  test_mode = false,
  external_ids,
  functionConcurrency,
  businessesPerFunction,
  addDays = 0,
}: {
  cohort_external_id: number
  check_dow: day_of_week_names
  check_time: string
  sendToSeated?: boolean
  limit?: number
  test_mode?: boolean
  external_ids?: number[]
  functionConcurrency?: number
  businessesPerFunction?: number
  addDays?: number
}) => {
  const cohort = await getLatestCohortForExternalId(cohort_external_id)
  if (!cohort) {
    throw new ResourceNotFound(`Cohort: ${cohort_external_id}`)
  }
  const cohort_id = cohort.id

  const businesses = await prisma.business.findMany({
    where: {
      cohort_id: cohort.id,
      archived_at: null,
      ...(external_ids ? { external_id: { in: external_ids } } : {}),
    },
    ...(limit ? { take: limit } : {}),
    orderBy: [{ id: 'desc' }],
  })

  const { party_sizes } = cohort
  const { slot_times } = await cohortSlotTimes({
    cohort,
    check_dow,
    check_time,
    addDays,
  })

  const num_businesses = businesses.length
  const slots_per_run = slot_times.length
  const num_party_sizes = party_sizes.length
  const expected_num_slots = num_businesses * slots_per_run * num_party_sizes

  const {
    functionConcurrency: suggestedFnConcurrency,
    businessesPerFunction: suggestedBizPerFn,
  } = concurrencyConfig({
    check_dow,
    check_time,
    cohort_external_id,
    num_slots: slots_per_run,
    num_party_sizes,
    num_businesses,
  })

  functionConcurrency = functionConcurrency ?? suggestedFnConcurrency
  businessesPerFunction = businessesPerFunction ?? suggestedBizPerFn

  logger.debug({
    check_dow,
    check_time,
    cohort_id,
    cohort_external_id,
    num_businesses,
    slots_per_biz: slots_per_run * num_party_sizes,
    sendToSeated,
    test_mode,
    functionConcurrency,
    businessesPerFunction,
    addDays,
  })

  const existingBatch = await prisma.batch.findFirst({
    where: {
      check_date: new Date(),
      check_time,
      check_dow,
      cohort_id,
      cohort_external_id,
      deleted_at: null,
      test_mode,
    },
  })

  const batch =
    existingBatch ??
    (await prisma.batch.create({
      data: {
        check_date: new Date(),
        check_time,
        check_dow,
        cohort_id,
        cohort_external_id,
        function_concurrency: functionConcurrency,
        businesses_per_function: businessesPerFunction,
        num_businesses,
        slots_per_run,
        num_party_sizes,
        expected_num_slots,
        test_mode,
      },
    }))

  await seatedRedisService.setBusinesses({ cohort_external_id, batch_id: batch.id, businesses })

  const argForExternalIds = (external_ids: number[]): IArgForOne => ({
    data: {
      batch_id: batch.id,
      cohort_id,
      cohort_external_id,
      check_dow,
      check_time,
      sendToSeated,
      test_mode,
      external_ids,
      addDays,
    },
  })
  const chunkSize =
    businesses.length / functionConcurrency <= businessesPerFunction - 1
      ? (max([businesses.length / functionConcurrency, 1]) as number)
      : businessesPerFunction

  const args = (shuffle(
    map(
      (ext_ids: number[]) => argForExternalIds(ext_ids),
      chunk(chunkSize, shuffle(map('external_id', businesses)))
    )
  ) as unknown) as IArgForOne[]

  let argsToRetry: IArgForOne[] = []

  /**
   * For any arguments that error out, will add to args to retry
   */
  const runForOne = async (args: IArgForOne) => {
    const makeRequest = async () => {
      logger.debug(`Running for`, args)
      return superagent
        .post(URL)
        .set('Authorization', `Basic ${AUTOMATIONS_TOKEN}`)
        .send(args)
        .accept('json')
        .timeout(TIMEOUT_OBJ)
        .then(get('body.data.summary'))
        .then((result: IRunForCohortResult['summary']) => {
          logger.info(result)
          return result
        })
    }
    try {
      const ret = await makeRequest()
      return ret
    } catch (err: any) {
      logger.error(err, args)
      argsToRetry.push(args)
      return
    }
  }

  logger.info(URL)

  const startTime = performance.now()
  const allResults = compact(await pMap(args, runForOne, { concurrency: functionConcurrency }))
  const endTime = performance.now()

  const summary = allResults

  const numBusinesses = sum(map('numBusinesses', summary))
  const totalSlotsChecked = sum(map('totalSlotsChecked', summary))
  const totalSlotsExpected = sum(map('totalSlotsExpected', summary))
  const totalSeconds = (endTime - startTime) / 1000.0
  const slotsPerSecond = totalSlotsChecked / totalSeconds
  const badResults = filter({ slotsCheckedEqExpected: false }, summary)

  if (size(badResults) === 0) {
    logger.info(`All results good`)
  } else {
    logger.error(`Bad Results`, badResults)
  }

  let retries = 0
  let runsRetried = 0

  each((badResult) => argsToRetry.push({ data: badResult }), badResults)

  while (retries < MAX_RETRIES && !isEmpty(argsToRetry)) {
    logger.info(
      `multi-helper: Retrying ${argsToRetry.length} runs, retries: ${retries}`,
      argsToRetry
    )
    const retryArgs = map((argToRetry: IArgForOne) => ({ ...argToRetry, force: true }), argsToRetry)
    runsRetried += retryArgs.length
    argsToRetry = []
    const retryResults = compact(
      await pMap(retryArgs, runForOne, { concurrency: functionConcurrency })
    )
    const badResults2 = filter({ slotsCheckedEqExpected: false }, retryResults)
    each((badResult) => argsToRetry.push({ data: badResult }), badResults2)

    if (isEmpty(argsToRetry)) {
      break
    } else {
      retries += 1
    }
  }

  if (!isEmpty(argsToRetry)) {
    logger.error(`Run-multi: maximum retries reached`, { argsToRetry, retries })
  }

  // A catch-all to ensure that we retry one more time to send all failed uploads at the end of a job
  await resendFailed()

  return {
    batch_id: batch.id,
    external_ids,
    check_dow,
    check_time,
    cohort_external_id,
    cohort_id: cohort.id,
    limit,
    numBusinesses,
    sendToSeated,
    slotsCheckedEqExpected: Boolean(totalSlotsChecked === totalSlotsExpected),
    slotsPerSecond,
    test_mode,
    totalSeconds,
    totalSlotsChecked,
    totalSlotsExpected,
    functionConcurrency,
    businessesPerFunction,
    runsRetried,
  }
}

const concurrencyConfig = ({
  check_dow,
  check_time,
  cohort_external_id,
  num_slots,
  num_party_sizes,
  num_businesses,
}: {
  check_dow: string
  check_time: string
  cohort_external_id: number
  num_slots: number
  num_party_sizes: number
  num_businesses: number
}) => {
  if (
    ((cohort_external_id >= 40 && cohort_external_id <= 49) ||
      (cohort_external_id >= 70 && cohort_external_id <= 79) ||
      (cohort_external_id >= 50 && cohort_external_id <= 59)) &&
    ((check_dow === 'monday' && check_time !== '18:00') ||
      (check_dow === 'tuesday' && check_time !== '19:00' && check_time !== '17:00') ||
      (check_dow === 'wednesday' && check_time !== '17:00') ||
      (check_dow === 'thursday' && check_time !== '19:00') ||
      (check_dow === 'friday' &&
        (check_time === '08:00' ||
          check_time === '09:00' ||
          check_time === '10:00' ||
          check_time === '12:00' ||
          check_time === '13:00' ||
          check_time === '15:00' ||
          check_time === '17:00' ||
          check_time === '17:30' ||
          check_time === '18:00' ||
          check_time === '18:30')) ||
      (check_dow === 'saturday' &&
        ![
          '11:00',
          '15:00',
          '16:30',
          '18:00',
          '18:15',
          '18:30',
          '18:45',
          '19:00',
          '19:15',
          '19:30',
          '19:45',
          '20:00',
          '20:15',
          '20:30',
        ].includes(check_time)) ||
      (check_dow === 'sunday' && (check_time === '08:00' || check_time === '16:00')))
  ) {
    return {
      functionConcurrency: 5,
      businessesPerFunction: 8,
    }
  }

  const functionConcurrency = num_businesses > 500 ? 20 : 15

  // Businesses per function is based on the fact that we have a 900 second max runtime
  // And assuming a worse case scenario of 1 slot/s (which is below our slowest opentable biz's)
  // With a max of 8 and a min of 2
  const businessesPerFunction = BUSINESS_PER_FUNCTION || 2
  logger.debug({
    businessesPerFunction,
    num_slots,
    num_party_sizes,
  })
  return { functionConcurrency, businessesPerFunction }
}

export { concurrencyConfig, getCurrentCheckTime, runMulti }
