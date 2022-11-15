import logger from '@invisible/logger'
import fs from 'fs'
import { map, pick, reduce, uniq } from 'lodash/fp'
import pMap from 'p-map'
import pSleep from 'p-sleep'
import * as Papa from 'papaparse'
import path from 'path'
import type { Cohort, CohortSchedule } from 'prisma-seated'

import { prisma } from '../config/prisma'
import { getLatestCohortForExternalId } from '../helpers/cohort'
import { handleKnownErrors } from '../helpers/errors'
import { PLATFORMS, TCity, TPlatform } from '../helpers/types'
import { getOpentableId, getOpentableIdFromUrl } from '../opentable/helpers/platformId'
import { opentableReservationUrl } from '../opentable/helpers/url'
import { getResyUrlId, resyRestaurantUrl } from '../resy/helpers/platformId'
import { getSevenroomsId } from '../sevenrooms/helpers/platformId'
import { sevenroomsReservationUrl } from '../sevenrooms/helpers/url'
import { getYelpUrlIdLatLong, yelpSlugFromUrl } from '../yelp/helpers/platformId'
import { yelpReservationUrl } from '../yelp/helpers/url'

const REQ_CONCURRENCY = 20
const MAX_RETRIES = 20

const dynamicTyping = (k: string | number) => k !== 'url_id' && k !== 'name'

const papaConfig = {
  header: true,
  skipEmptyLines: true,
  dynamicTyping,
}

const readCSV = (fname: string) =>
  fs.readFileSync(path.join(__dirname, 'data', fname), {
    encoding: 'utf-8',
  })

const getBusinessMetadata = async ({
  external_id,
  name,
  cohort_id,
  cohort_external_id,
  platform,
  new_url,
  timezone,
  city,
}: {
  external_id: number
  name: string
  cohort_id: number
  cohort_external_id: number
  platform: TPlatform
  new_url: string
  timezone?: string
  city?: TCity
}): Promise<
  | {
      external_id: number
      name: string
      cohort_id: number
      cohort_external_id: number
      original_url: string
      url: string
      url_id: string
      platform: TPlatform
      timezone?: string
      latitude?: number
      longitude?: number
      city?: TCity
    }
  | undefined
> => {
  const data = {
    external_id,
    name,
    cohort_id,
    cohort_external_id,
    original_url: new_url,
    platform,
    timezone,
    city,
  }
  let retries = 0
  await pSleep(3000)
  while (retries < MAX_RETRIES) {
    logger.info(`Trying: ${new_url}, retries: ${retries}`)
    try {
      if (platform === PLATFORMS.OPENTABLE) {
        const url_id = await getOpentableId(new_url)
        const url = opentableReservationUrl(url_id)
        return { ...data, url_id, url }
      } else if (platform === PLATFORMS.RESY) {
        const url = resyRestaurantUrl(new_url)
        const url_id = await getResyUrlId(url)
        return { ...data, url_id, url }
      } else if (platform === PLATFORMS.SEVENROOMS) {
        const url_id = await getSevenroomsId(new_url)
        const url = sevenroomsReservationUrl(url_id)
        return { ...data, url_id, url }
      } else if (platform === PLATFORMS.YELP) {
        const slug = yelpSlugFromUrl(new_url)
        const url = yelpReservationUrl(slug)
        try {
          const { url_id, latitude, longitude } = await getYelpUrlIdLatLong(url)
          return { ...data, url_id, url, latitude, longitude }
        } catch (yelpErr: any) {
          logger.error(yelpErr)
          if (yelpErr.message.includes('latitude') || yelpErr.message.includes('longitude')) {
            logger.error(
              `${PLATFORMS.YELP}: could not retrieve latitude and longitude for ${url}`,
              data
            )
          }
          return
        }
      } else {
        throw new Error(`Unknown platform ${platform}`)
      }
    } catch (err: any) {
      handleKnownErrors({
        PLATFORM_NAME: platform,
        err,
        errMeta: data,
      })
      retries += 1
      continue
    }
  }
  logger.error(`Maximum retries reached`, data)
  return
}

const updateOneBusiness = async ({
  external_id,
  name,
  cohort_id,
  cohort_external_id,
  platform,
  new_url,
  timezone,
  city,
}: {
  external_id: number
  name: string
  cohort_id: number
  cohort_external_id: number
  platform: TPlatform
  new_url: string
  timezone?: string
  city?: TCity
}) => {
  const args = {
    external_id,
    name,
    cohort_id,
    cohort_external_id,
    platform,
    new_url,
    timezone,
    city,
  }

  logger.info(`Updating: `, args)

  const existing = await prisma.business.findFirst({
    where: { external_id },
    orderBy: { id: 'desc' },
  })

  if (!existing) {
    logger.info(`Non-existent`, args)
    const data = await getBusinessMetadata(args)

    if (data) {
      logger.info(data)
      return prisma.business.create({ data })
    }

    logger.error(`Something went wrong. Business not updated`, args)
    return
  }

  logger.info({ existing })

  // It exists, so copy it
  if (new_url === existing.original_url || new_url === existing.url) {
    logger.info(`${platform}: Found existing, and the urls are the same`)
    const data = {
      ...pick(
        [
          'external_id',
          'platform',
          'original_url',
          'url',
          'url_id',
          'latitude',
          'longitude',
          'slot_interval',
        ],
        existing
      ),
      name,
      cohort_id,
      cohort_external_id,
      timezone,
      city,
    }
    logger.info(data)
    return prisma.business.create({ data })
  } else if (platform === existing.platform) {
    logger.info(`Existing found with same platform but different urls`)
    if (platform === PLATFORMS.OPENTABLE) {
      const url_id = await getOpentableIdFromUrl(new_url)
      if (url_id && existing.url_id === url_id) {
        logger.info(`${PLATFORMS.OPENTABLE} same url id`)
        const data = {
          ...pick(['external_id', 'url_id', 'latitude', 'longitude', 'slot_interval'], existing),
          name,
          cohort_id,
          cohort_external_id,
          original_url: new_url,
          url: opentableReservationUrl(url_id),
          platform,
          timezone,
          city,
        }
        logger.info(data)
        return prisma.business.create({ data })
      } else {
        // do nothing, it will fall through and create as normal
      }
    }
    const data = await getBusinessMetadata(args)
    if (data) {
      logger.info(data)
      return prisma.business.create({ data })
    }

    logger.error(`Something went wrong. Business not updated`, args)
    return
  } else {
    logger.info(`Existing, but changed platform from ${existing.platform} to ${platform}`)
    const data = await getBusinessMetadata(args)
    if (data) {
      logger.info(data)
      return prisma.business.create({ data })
    }

    logger.error(`Something went wrong. Business not updated`, args)
    return
  }
}

const archiveAndCreateCohort = async (cohort_external_id: number) => {
  const existing = await getLatestCohortForExternalId(cohort_external_id)
  if (!existing) {
    const data = {
      external_id: cohort_external_id,
      name: `Cohort ${cohort_external_id}`,
      party_sizes: [2, 4, 6],
    }
    return prisma.cohort.create({ data })
  }
  const data = pick(['external_id', 'name', 'party_sizes', 'slot_interval'], existing)
  const newCohort = await prisma.cohort.create({ data })
  await prisma.cohort.update({
    where: { id: existing.id },
    data: { archived_at: new Date() },
  })

  // Don't bother duplicating the businesses, because we will be adding them back in
  await prisma.business.updateMany({
    where: { cohort_id: existing.id },
    data: { archived_at: new Date() },
  })

  const cohortSchedules = await prisma.cohortSchedule.findMany({
    where: { cohort_id: existing.id },
  })

  // DO duplicate the cohort schedules, since they are not going to be added back in with this function
  const newCohortScheduleArgs = map(
    (cohortSchedule: CohortSchedule) => ({
      ...pick(
        [
          'cohort_external_id',
          'check_dow',
          'check_time',
          'slots_dow',
          'slots_start_time',
          'slots_end_time',
        ],
        cohortSchedule
      ),
      cohort_id: newCohort.id,
    }),
    cohortSchedules
  )

  await prisma.cohortSchedule.createMany({ data: newCohortScheduleArgs })
  await prisma.cohortSchedule.updateMany({
    where: { cohort_id: existing.id },
    data: { archived_at: new Date() },
  })

  return newCohort
}

const createNewCohorts = async (cohort_external_ids: number[]) =>
  Promise.all(
    map(async (cohort_external_id: number) => {
      return archiveAndCreateCohort(cohort_external_id)
    }, cohort_external_ids)
  )

interface IBusinessUpdate {
  external_id: number
  name: string
  cohort_external_id: number
  timezone: string
  platform: TPlatform
  new_url: string
  city: TCity
}

const updateBusinesses = async () => {
  const businessesCSV = readCSV('businesses-update.csv')
  const rawBusinesses = Papa.parse<IBusinessUpdate>(businessesCSV, papaConfig).data
  const cohort_external_ids = uniq(map('cohort_external_id', rawBusinesses))
  const newCohorts = await createNewCohorts(cohort_external_ids)

  const cohortsMap: Record<number, Cohort> = reduce(
    (acc, cur) => ({ ...acc, [cur.external_id]: cur }),
    {},
    newCohorts
  )

  logger.info(cohortsMap)

  const args = map(
    (businessUpdate: IBusinessUpdate) => ({
      ...businessUpdate,
      cohort_id: cohortsMap[businessUpdate.cohort_external_id].id,
    }),
    rawBusinesses
  )

  logger.info(`Updating: ${args.length} businesses`)

  return pMap(args, updateOneBusiness, { concurrency: REQ_CONCURRENCY })
}

const updateBusinessesSeedFile = async () => {
  const allBusinesses = await prisma.business.findMany({
    where: { archived_at: null, deleted_at: null },
    orderBy: [{ external_id: 'asc' }],
    select: {
      id: true,
      external_id: true,
      cohort_id: true,
      cohort_external_id: true,
      platform: true,
      name: true,
      original_url: true,
      url: true,
      url_id: true,
      timezone: true,
      city: true,
      slot_interval: true,
      latitude: true,
      longitude: true,
      archived_at: true,
    },
  })
  logger.info(`Writing new seed file to businesses.csv`)

  const csv = Papa.unparse(allBusinesses, {
    columns: [
      'id',
      'external_id',
      'cohort_id',
      'cohort_external_id',
      'platform',
      'name',
      'original_url',
      'url',
      'url_id',
      'timezone',
      'city',
      'slot_interval',
      'latitude',
      'longitude',
      'archived_at',
    ],
    quotes: [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
    newline: '\n',
  })

  fs.writeFileSync(path.join(__dirname, 'data', 'businesses.csv'), csv)
}

export {
  archiveAndCreateCohort,
  createNewCohorts,
  papaConfig,
  readCSV,
  updateBusinesses,
  updateBusinessesSeedFile,
  updateOneBusiness,
}
export type { IBusinessUpdate }
