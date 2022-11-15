import logger from '@invisible/logger'
import { map, omit, reduce, uniq } from 'lodash/fp'
import * as Papa from 'papaparse'
import type { Business, Cohort } from 'prisma-seated'

import { prisma } from '../config/prisma'
import { createNewCohorts, papaConfig, readCSV } from './updateBusinessesHelper'

interface ICohortUpdate {
  cohort_external_id: number
  check_dow: string
  check_time: string
  slots_dow: string
  slots_start_time: string
  slots_end_time: string
}

const createNewCohortsAndSchedules = async () => {
  const cohortsCSV = readCSV('cohortSchedules.csv')
  const rawCohorts = Papa.parse<ICohortUpdate>(cohortsCSV, papaConfig).data
  const cohort_external_ids = uniq(map('cohort_external_id', rawCohorts))
  const oldCohorts = await prisma.cohort.findMany({
    where: {
      external_id: { in: cohort_external_ids },
      archived_at: null,
    },
  })
  logger.info('OLD COHORTS:', oldCohorts)
  // archives old cohorts and businesses and creates a new cohort
  const newCohorts = await createNewCohorts(cohort_external_ids)
  logger.info({ newCohorts })

  const cohortsMap: Record<number, Cohort> = reduce(
    (acc, cur) => ({ ...acc, [cur.external_id]: cur }),
    {},
    newCohorts
  )

  logger.info(cohortsMap)
  // create copy
  const allBusinesses = await prisma.business.findMany({
    where: {
      cohort_id: { in: oldCohorts.map((a) => a.id) },
    },
  })
  logger.info(`allBiz: ${allBusinesses}`)
  // mapping for the cohort ids
  const args = map(
    (business: Business) => ({
      ...omit(['id', 'archived_at'], business),
      cohort_id: cohortsMap[business.cohort_external_id].id,
    }),
    allBusinesses
  )
  logger.info(`args: ${args}`)

  return prisma.business.createMany({ data: args })
}

createNewCohortsAndSchedules().then(async () => {
  logger.info('Cohort Updates complete.')
  process.exit(0)
})
