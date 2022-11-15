import fs from 'fs'
import { each } from 'lodash/fp'
import Mustache from 'mustache'

import { formatInTimeZone, makeTimeRange } from '../helpers/date'

const TEMPLATE = fs.readFileSync(`${__dirname}/template.mustache`, {
  encoding: 'utf8',
})

const CURRENT_TEMPLATE = fs.readFileSync(`${__dirname}/current-template.mustache`, {
  encoding: 'utf8',
})

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const times = makeTimeRange({
  date: '2021-10-25',
  start: '00:00',
  end: '23:30',
  interval: 30,
  tz: 'UTC',
})
const cohorts = [4, 5, 6, 7, 8, 9]
/**
 * Generates ready made scripts in case we need to run cohorts manually
 * The scripts are just for convenience, any cohort can be run manually by calling
 * ts-node run-multi.ts with arguments
 */
const init = () => {
  each((check_dow: string) => {
    each((cohort_external_id: number) => {
      const dir = `${__dirname}/run/cohort-${cohort_external_id}/${check_dow}`
      each((check_time: Date) => {
        const t = formatInTimeZone({ date: check_time, fmt: 'HH:mm', tz: 'UTC' })
        const check_time_no_colon = formatInTimeZone({ date: check_time, fmt: 'HHmm', tz: 'UTC' })
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        const filled = Mustache.render(TEMPLATE, {
          check_dow,
          check_time: t,
          cohort_external_id,
          check_time_no_colon,
        })
        const fname = `${dir}/${check_time_no_colon}.sh`
        fs.writeFileSync(fname, filled)
        fs.chmodSync(fname, '755')
      }, times)

      const curr = Mustache.render(CURRENT_TEMPLATE, { cohort_external_id })
      const fname = `${__dirname}/run/cohort-${cohort_external_id}/current.sh`
      fs.writeFileSync(fname, curr)
      fs.chmodSync(fname, '755')
    }, cohorts)
  }, daysOfWeek)
}

init()
