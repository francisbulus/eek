import logger from '@invisible/logger'
import * as dateFns from 'date-fns'
import { groupBy, map, sortBy, sum, toLower, uniqBy } from 'lodash/fp'
import * as Papa from 'papaparse'
import { CohortSchedule, day_of_week_names } from 'prisma-seated'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { ResourceNotFound } from '../../helpers/errors'
import { prisma } from './config/prisma'
import { getLatestCohortForExternalId } from './helpers/cohort'
import { cohortSchedulesToTimeRanges } from './helpers/cohortSchedule'
import { allSlotTimes } from './helpers/slot'

const countForCohort = async ({
  cohort_external_id = 5,
  check_dow,
  check_time,
}: {
  cohort_external_id: number
  check_dow?: day_of_week_names
  check_time?: string
}) => {
  const cohort = await getLatestCohortForExternalId(cohort_external_id)
  if (!cohort) {
    throw new ResourceNotFound(`Cohort: ${cohort_external_id}`)
  }

  const businesses = await prisma.business.findMany({
    where: { cohort_id: cohort.id, archived_at: null },
  })

  const party_sizes = cohort.party_sizes

  const cohortSchedules = await prisma.cohortSchedule.findMany({
    where: {
      cohort_id: cohort.id,
      archived_at: null,
      ...(check_dow ? { check_dow } : {}),
      ...(check_time ? { check_time } : {}),
    },
  })

  const slotTimeRanges = cohortSchedulesToTimeRanges(cohortSchedules, 0)

  const slotTimes = allSlotTimes({
    slotTimeRanges,
    interval: cohort.slot_interval,
    tz: 'America/New_York',
  })

  const num_slots = slotTimes.length
  const num_party_sizes = party_sizes.length
  const num_businesses = businesses.length
  const num_runs = num_businesses * num_party_sizes
  const num_slots_per_biz = num_party_sizes * num_slots
  const total = num_slots * num_party_sizes * num_businesses
  return {
    cohort_id: cohort.id,
    cohort_external_id,
    check_dow,
    check_time,
    total,
    num_slots,
    num_businesses,
    num_party_sizes,
    num_runs,
    num_slots_per_biz,
  }
}

const init = async () => {
  const argv: any = yargs(hideBin(process.argv)).argv
  logger.info(new Date())
  logger.info(argv)

  const cohortSchedules = await prisma.cohortSchedule.findMany({
    where: {
      check_dow: argv.check_dow ?? toLower(dateFns.format(new Date(), 'iiii')),
      archived_at: null,
    },
  })
  const uniqs = uniqBy(
    (ch: CohortSchedule) => `${ch.cohort_id}-${ch.check_dow}-${ch.check_time}`,
    cohortSchedules
  )
  const ret = sortBy(['check_time', 'cohort_id'], await Promise.all(map(countForCohort, uniqs)))
  const by_check_time = groupBy((a: any) => [a.check_dow, a.check_time], ret)
  const check_time_sums = map(
    (a: any) => ({
      check_time: a[0].check_time,
      total: sum(map('total', a)),
    }),
    by_check_time
  )

  logger.info(Papa.unparse(ret))
  logger.info(Papa.unparse(check_time_sums))

  return sum(map('total', ret))
}

init().then((a) => {
  logger.info(a)
  process.exit(0)
})
