import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'
import { map } from 'lodash/fp'
import type { Cohort, CohortSchedule, day_of_week_names } from 'prisma-seated'

import { prisma } from '../config/prisma'
import { nextDateForDow } from './date'
import { allSlotTimes } from './slot'
import type { ISlotTimeRange } from './types'

const cohortSlotTimes = async ({
  cohort,
  check_dow,
  check_time,
  addDays,
}: {
  cohort: Cohort
  check_dow: day_of_week_names
  check_time: string
  addDays?: number
}) => {
  const cohortSchedules = await prisma.cohortSchedule.findMany({
    where: { cohort_id: cohort.id, check_dow, check_time },
  })
  const slotTimeRanges = cohortSchedulesToTimeRanges(cohortSchedules, addDays)

  // Just used for the summary report
  const slot_times = allSlotTimes({
    slotTimeRanges,
    interval: cohort.slot_interval,
    tz: 'America/New_York',
  })

  return { slot_times, slotTimeRanges }
}

const cohortSchedulesToTimeRanges = (
  cohortSchedules: CohortSchedule[],
  addDays?: number
): ISlotTimeRange[] =>
  map(
    (ch: CohortSchedule) => ({
      slots_date: dateFnsTz.format(
        dateFns.addDays(nextDateForDow({ dow: ch.slots_dow }), addDays || 0),
        'yyyy-MM-dd',
        {
          timeZone: 'America/New_York',
        }
      ),
      slots_start_time: ch.slots_start_time,
      slots_end_time: ch.slots_end_time,
    }),
    cohortSchedules
  )

export { cohortSchedulesToTimeRanges, cohortSlotTimes }
