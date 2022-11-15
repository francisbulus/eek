import logger from '@invisible/logger'
import { last, map, max, split, without } from 'lodash/fp'

import { SEATED_DATABASE_URL } from '../config/env'
import { prisma } from '../config/prisma'
import { getSeedData } from './data'

const seedAll = async () => {
  logger.info(`Seeding db: ${last(split('/', SEATED_DATABASE_URL))}`)

  const { businesses, cohorts, cohortSchedules } = getSeedData()

  await prisma.$queryRaw`TRUNCATE TABLE cohort_schedules CASCADE;`
  await prisma.$queryRaw`TRUNCATE TABLE businesses CASCADE;`
  await prisma.$queryRaw`TRUNCATE TABLE cohorts CASCADE;`
  await prisma.$queryRaw`TRUNCATE TABLE runs CASCADE;`
  await prisma.$queryRaw`TRUNCATE TABLE slots CASCADE;`

  const bizWithOriginalUrl = map(
    (b) => ({ ...b, original_url: b.url, cohort_id: b.cohort_external_id }),
    businesses
  )
  const cohortSchedules2 = map(
    (cs) => ({ ...cs, cohort_id: cs.cohort_external_id }),
    cohortSchedules
  )

  const actualCohorts = await prisma.cohort.createMany({ data: cohorts })
  const actualBusinesses = await prisma.business.createMany({ data: bizWithOriginalUrl })
  const actualCohortSchedules = await prisma.cohortSchedule.createMany({ data: cohortSchedules2 })

  const maxBusinessId = max(map('id', businesses))
  const maxCohortId = max(without([99999999], map('id', cohorts)))

  await prisma.$queryRaw`SELECT setval('businesses_id_seq', ${maxBusinessId}, true);`
  await prisma.$queryRaw`SELECT setval('cohorts_id_seq', ${maxCohortId}, true);`

  return {
    cohorts: actualCohorts,
    cohortSchedules: actualCohortSchedules,
    businesses: actualBusinesses,
  }
}

const seedCohortSchedules = async () => {
  logger.info(`Seeding db: ${last(split('/', SEATED_DATABASE_URL))}`)
  const { cohortSchedules } = getSeedData()
  await prisma.cohortSchedule.updateMany({ data: { archived_at: new Date() } })
  const actualCohortSchedules = await prisma.cohortSchedule.createMany({ data: cohortSchedules })

  return {
    cohortSchedules: actualCohortSchedules,
  }
}

const seedBiz = async () => {
  logger.info(`Seeding db: ${last(split('/', SEATED_DATABASE_URL))}`)
  const { businesses } = getSeedData()

  if (businesses.some((b) => b.cohort_external_id >= 1000) === true) {
    // handle bulk update for special cohorts e.g leads (id: 1001).
    // set cohort_external_id to that of the first business that satisfies
    // the >1000 condition
    await prisma.business.updateMany({
      where: {
        cohort_external_id: businesses.find((b) => b.cohort_external_id >= 1000)!
          .cohort_external_id,
      },
      data: { archived_at: new Date() },
    })
  } else {
    await prisma.business.updateMany({
      where: {
        cohort_external_id: {
          lt: 1000,
        },
      },
      data: { archived_at: new Date() },
    })
  }

  const actualCohortSchedules = await prisma.business.createMany({ data: businesses })

  return {
    cohortSchedules: actualCohortSchedules,
  }
}

export { seedAll, seedBiz, seedCohortSchedules }
