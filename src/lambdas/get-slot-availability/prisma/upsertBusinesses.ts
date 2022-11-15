import logger from '@invisible/logger'
import fs from 'fs'
import pMap from 'p-map'
import * as Papa from 'papaparse'
import path from 'path'

import { prisma } from '../config/prisma'
import { TPlatform } from '../helpers/types'

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

const upsertOneBusiness = async ({
  external_id,
  cohort_id,
  cohort_external_id,
  name,
  original_url,
  url,
  slot_interval,
  url_id,
  platform,
  latitude,
  longitude,
  timezone,
}: {
  external_id: number
  name: string
  cohort_id: number
  cohort_external_id: number
  original_url: string
  url: string
  slot_interval: number
  url_id: string
  platform: TPlatform
  timezone?: string
  latitude?: number
  longitude?: number
}) => {
  // Are we updating a business in a current cohort?
  const existing = await prisma.business.findUnique({
    where: { cohort_id_external_id: { external_id, cohort_id } },
  })

  if (!existing) {
    logger.info(`Non-existent`, { external_id, name, cohort_id, platform, url, timezone })
    const data = {
      external_id,
      cohort_id,
      cohort_external_id,
      name,
      original_url,
      url,
      slot_interval,
      url_id,
      platform,
      latitude,
      longitude,
      timezone,
    }
    return prisma.business.create({ data })
  }

  logger.info('existent', { external_id, name, cohort_id, platform, url, timezone })
  const data = {
    cohort_id,
    cohort_external_id,
    name,
    original_url,
    url,
    slot_interval,
    url_id,
    platform,
    latitude,
    longitude,
    timezone,
  }
  return prisma.business.update({
    where: { id: existing.id },
    data,
  })
}

const upsertAllBusinesses = async () => {
  const businessesCSV = readCSV('businesses.csv')
  const rawBusinesses = Papa.parse<any>(businessesCSV, papaConfig).data
  return pMap(rawBusinesses, upsertOneBusiness, { concurrency: 5 })
}

upsertAllBusinesses().then(logger.info)

export { upsertAllBusinesses }
