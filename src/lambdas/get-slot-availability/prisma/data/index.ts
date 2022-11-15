import * as dateFns from 'date-fns'
import fs from 'fs'
import { flatMap, keys, last, map, split } from 'lodash/fp'
import * as Papa from 'papaparse'
import path from 'path'
import { Prisma } from 'prisma-seated'

import { PLATFORMS } from '../../helpers/types'

/**
 * url_id should be a string, but will automatically be parsed as an int if it's numeric
 * name should be a string, but some restaurants (like the one called "18") will be automatically parsed as int
 * @see https://www.papaparse.com/docs#config
 */
const dynamicTyping = (k: string | number) => k !== 'url_id' && k !== 'name'

const transform = (v: string, k: string) => (k === 'party_sizes' ? JSON.parse(v) : v)

const papaConfig = {
  header: true,
  skipEmptyLines: true,
  dynamicTyping,
  transform,
}

const readCSV = (fname: string) =>
  fs.readFileSync(path.join(__dirname, fname), {
    encoding: 'utf-8',
  })

const getSeedData = () => {
  const businessesCSV = readCSV('businesses.csv')
  const cohortsCSV = readCSV('cohorts.csv')
  const cohortSchedulesCSV = readCSV('cohortSchedules.csv')

  const rawBusinesses = Papa.parse<Prisma.BusinessCreateManyInput>(businessesCSV, papaConfig).data

  const businesses = map(
    (biz) => ({
      ...biz,
      slot_interval: 15, // hardcoded for now, should move to cohort table later
      timezone: biz.timezone ?? undefined,
      ...(biz.platform === PLATFORMS.SEVENROOMS && !biz.url_id
        ? { url_id: last(split('/', biz.url)) }
        : {}),
    }),
    rawBusinesses
  )

  const cohorts = Papa.parse<Prisma.CohortCreateManyInput>(cohortsCSV, papaConfig).data
  const cohortSchedules = Papa.parse<Prisma.CohortScheduleCreateManyInput>(
    cohortSchedulesCSV,
    papaConfig
  ).data

  return { businesses, cohorts, cohortSchedules }
}

const zeroPadHourMinute = (t: string) =>
  dateFns.format(dateFns.parse(t, 'HH:mm', new Date()), 'HH:mm')

/**
 * Converts cohort schedules from old format to new
 *
 * Use this query on the old database
 * SELECT id,name, REPLACE(schedule::TEXT ,E'\n',' ') AS schedule FROM seated.cohorts ORDER BY id;
 */
const convertOldSchedules = () => {
  const oldCohortsCSV = readCSV('oldCohorts.csv')
  const oldCohorts = Papa.parse(oldCohortsCSV, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    quoteChar: "'",
  }).data

  const parsed = map(
    (oldCohort: any) => ({ ...oldCohort, schedule: JSON.parse(oldCohort.schedule) }),
    oldCohorts
  )

  const rows = (flatMap(({ id, schedule }: { id: number; schedule: Record<string, any> }) => {
    const checkDows = keys(schedule)
    return flatMap((checkDow: string) => {
      const checksForDow = schedule[checkDow]
      const checkTimes = keys(checksForDow)
      return flatMap((checkTime: string) => {
        const checksForDowAtTime = checksForDow[checkTime]
        const slotDows = keys(checksForDowAtTime)
        return flatMap((slotDow: string) => {
          const slots = checksForDowAtTime[slotDow]
          // We add an hour to the end time here because the new format should include the end point
          // Previously, the schedule assumed that it would add another hour, this makes it explicit
          return map(
            ({ start, end }: { start: string; end: string }) => [
              id,
              checkDow,
              zeroPadHourMinute(checkTime),
              slotDow,
              zeroPadHourMinute(start),
              zeroPadHourMinute(end),
            ],
            slots
          )
        }, slotDows)
      }, checkTimes)
    }, checkDows)
  }, parsed) as any[]) as [number, string, string, string, string, string][]

  const csv = Papa.unparse(
    [
      ['cohort_id', 'check_dow', 'check_time', 'slots_dow', 'slots_start_time', 'slots_end_time'],
      ...rows,
    ],
    { quotes: [false, false, true, false, true, true], newline: '\n' }
  )
  fs.writeFileSync(path.join(__dirname, 'cohortSchedules.csv'), csv)
}

export { convertOldSchedules, getSeedData }
