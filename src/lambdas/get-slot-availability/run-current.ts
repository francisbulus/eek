import logger from '@invisible/logger'
import { isEmpty } from 'lodash/fp'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { initErrorCatcher, ResourceNotFound } from '../../helpers/errors'
import { prisma } from './config/prisma'
import { getLatestCohortForExternalId } from './helpers/cohort'
import { cohortSchedulesToTimeRanges } from './helpers/cohortSchedule'
import { allSlotTimes } from './helpers/slot'
import { concurrencyConfig, getCurrentCheckTime, runMulti } from './multi-helper'

initErrorCatcher()

const init = async () => {
  const argv: any = yargs(hideBin(process.argv)).argv

  logger.info(new Date())
  logger.info(argv)

  const { cohort_external_id, external_ids, limit, sendToSeated, test_mode, addDays } = argv

  if (!cohort_external_id) {
    logger.info(`No cohort_external_id passed in, exiting`)
    return
  }

  const cohort = await getLatestCohortForExternalId(cohort_external_id)
  if (!cohort) {
    throw new ResourceNotFound(`Cohort: ${cohort_external_id}`)
  }

  const { check_dow, check_time } = getCurrentCheckTime()

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
  const cohortSchedules = await prisma.cohortSchedule.findMany({
    where: { cohort_id: cohort.id, check_dow, check_time },
  })

  if (isEmpty(cohortSchedules)) {
    logger.info(
      `No cohort schedule found for cohort: ${cohort_external_id} at ${check_dow}, ${check_time}`
    )
    return
  }

  const slotTimeRanges = cohortSchedulesToTimeRanges(cohortSchedules, addDays)
  const slot_times = allSlotTimes({
    slotTimeRanges,
    interval: cohort!.slot_interval,
    tz: 'America/New_York',
  })

  logger.info(new Date())
  logger.info(argv)

  const { functionConcurrency, businessesPerFunction } = concurrencyConfig({
    num_slots: slot_times.length,
    num_party_sizes: party_sizes.length,
    num_businesses: businesses.length,
    check_dow,
    check_time,
    cohort_external_id,
  })

  logger.info({
    cohort_id: cohort.id,
    cohort_external_id,
    check_dow,
    check_time,
    functionConcurrency,
    businessesPerFunction,
    sendToSeated,
    test_mode,
    limit,
    external_ids,
    addDays,
  })

  return runMulti({
    cohort_external_id,
    check_dow,
    check_time,
    functionConcurrency,
    businessesPerFunction,
    sendToSeated,
    test_mode,
    limit,
    external_ids,
    addDays,
  })
    .then((a) => {
      logger.info(a)
      logger.info(new Date())
      process.exit(0)
    })
    .catch((err) => {
      logger.error(err)
      logger.info(new Date())
      process.exit(1)
    })
}

init().then((a: any) => {
  logger.debug(a)
  process.exit(0)
})
