import * as dateFns from 'date-fns'
import * as dateFnsTz from 'date-fns-tz'
import { sortBy, times, toLower } from 'lodash/fp'
import { day_of_week_names } from 'prisma-seated'

const ISODowNumbers = {
  [day_of_week_names.monday]: 1,
  [day_of_week_names.tuesday]: 2,
  [day_of_week_names.wednesday]: 3,
  [day_of_week_names.thursday]: 4,
  [day_of_week_names.friday]: 5,
  [day_of_week_names.saturday]: 6,
  [day_of_week_names.sunday]: 7,
} as const

/**
 * Given a date, format it as a string in the given time zone, with the given format
 */
const formatInTimeZone = ({
  date,
  tz,
  fmt = `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`,
}: {
  date: Date
  tz: string
  fmt?: string
}) => dateFnsTz.format(dateFnsTz.utcToZonedTime(date, tz), fmt, { timeZone: tz })

/**
 * Given a string with no time zone, parse it as a date in UTC
 */
const parseAsUTC = (s: string) => dateFnsTz.zonedTimeToUtc(s, 'UTC')

/**
 * Given a date (with or without time zone), format it in UTC time
 */
const formatAsUTC = (d: Date, fmt?: string) => formatInTimeZone({ date: d, tz: 'UTC', fmt })

const parseReparseUTC = (x: string | Date) => (typeof x === 'string' ? parseAsUTC(x) : x)

/**
 * Returns an array of dates of time slots in the range, including start and end
 * date is a string in yyyy-MM-dd format
 * start and end time are given in HH:mm format
 * date, start, end are in the timezone specified by tz
 * interval is in minutes and should evenly divide the range
 */
const makeTimeRange = ({
  date,
  start,
  end,
  interval,
  tz = 'UTC',
}: {
  date: string
  start: string
  end: string
  interval: number
  tz?: string
}) => {
  const { startTime, endTime } = makeStartAndEndTime({ date, start, end, tz })
  if (startTime.toISOString() === endTime.toISOString()) {
    return [startTime]
  }

  const minutes = dateFns.differenceInMinutes(endTime, startTime)

  if (minutes % interval !== 0) {
    throw new Error(
      `Interval of ${interval} minutes does not divide evenly for given time range ${start} to ${end}.`
    )
  }

  const iterations = minutes / interval + 1
  return sortBy(
    (d: Date) => d.valueOf(),
    times((index) => dateFns.add(startTime, { minutes: index * interval }), iterations)
  )
}

/**
 * Creates the start and end time date objects for a given date and timezone.
 * Start and end time are given in HH:mm format.
 * date is a string in yyyy-MM-dd format.
 * If start and end are equal, returns a range object of just one time.
 */
const makeStartAndEndTime = ({
  date,
  start,
  end,
  tz = 'UTC',
}: {
  date: string
  start: string
  end: string
  tz?: string
}) => {
  const startTime = dateFnsTz.zonedTimeToUtc(`${date} ${start}`, tz)
  let endTime = dateFnsTz.zonedTimeToUtc(`${date} ${end}`, tz)

  if (dateFns.isBefore(endTime, startTime)) {
    // This is possible if we have a range that spans midnight
    endTime = dateFns.add(endTime, { days: 1 })
  }
  return { startTime, endTime }
}

const epochMs = (s: string | Date) => parseReparseUTC(s).valueOf()

const epochSeconds = (s: string | Date) => parseReparseUTC(s).valueOf() / 1000

/**
 * Rounds a given date to a given interval (default to 1 hour)
 */
const roundTime = (d: Date, intervalMs = 60 * 60 * 1000) =>
  new Date(Math.round(d.getTime() / intervalMs) * intervalMs)

const getDateInTz = ({
  date,
  tz,
  fmt = 'yyyy-MM-dd',
}: {
  date?: string
  tz: string
  fmt?: string
}) =>
  formatInTimeZone({
    date: date ? dateFnsTz.zonedTimeToUtc(date, tz) : new Date(),
    tz,
    fmt: fmt ?? 'yyyy-MM-dd',
  })

/**
 * Returns true if A is after B
 */
const flexibleIsAfter = (dateTimeA: string | Date, dateTimeB: string | Date) => {
  const a = parseReparseUTC(dateTimeA)
  const b = parseReparseUTC(dateTimeB)
  return dateFns.isAfter(a, b)
}

/**
 * Returns true if A is before B
 */
const flexibleIsBefore = (dateTimeA: string | Date, dateTimeB: string | Date) => {
  const a = parseReparseUTC(dateTimeA)
  const b = parseReparseUTC(dateTimeB)
  return dateFns.isBefore(a, b)
}

/**
 * Returns true if A is the same millisecond as B
 */
const flexibleIsSameDate = (dateTimeA: string | Date, dateTimeB: string | Date) => {
  const a = parseReparseUTC(dateTimeA)
  const b = parseReparseUTC(dateTimeB)
  return a.valueOf() === b.valueOf()
}

const flexibleIsBeforeOrEqual = (dateTimeA: string | Date, dateTimeB: string | Date) =>
  flexibleIsBefore(dateTimeA, dateTimeB) || flexibleIsSameDate(dateTimeA, dateTimeB)

/**
 * Given a day of the week and a timezone, returns the date for the next occurrence of that day of the week
 * Returns the same date if given the current day of the week
 */
const nextDateForDow = ({
  dow,
  tz = 'America/New_York',
}: {
  dow: day_of_week_names
  tz?: string
}) => {
  const now = new Date()
  const nowDow = toLower(dateFnsTz.format(now, 'iiii', { timeZone: tz })) as day_of_week_names
  if (dow === nowDow) return now
  const dayDiff = ISODowNumbers[dow] - ISODowNumbers[nowDow]
  return dayDiff < 0 ? dateFns.addDays(now, 7 + dayDiff) : dateFns.addDays(now, dayDiff)
}

/**
 * Given a time in HH:mm format, add a given number of minutes and return the new time (in HH:mm format)
 */
const addMinutesString = (s: string, minutes: number) =>
  dateFns.format(dateFns.addMinutes(dateFns.parse(s, 'HH:mm', new Date()), minutes), 'HH:mm')

/**
 * To compare only time with two Date objects, ignoring date
 */
const compareOnlyTime = (datetime1: Date, datetime2: Date) => {
  const tz = 'America/New_York'
  return (
    formatInTimeZone({
      date: datetime1,
      tz,
      fmt: 'HH:mm',
    }) ===
    formatInTimeZone({
      date: datetime2,
      tz,
      fmt: 'HH:mm',
    })
  )
}

const compareDayWithDateTime = (day: day_of_week_names, datetime: Date) => {
  const tz = 'America/New_York'
  return (
    day ===
    (formatInTimeZone({
      date: datetime,
      tz,
      fmt: 'iiii',
    }).toLowerCase() as day_of_week_names)
  )
}

const compareTimeWithDateTime = (timeString: string, datetime: Date, tz: string) => {
  return (
    timeString ===
    formatInTimeZone({
      date: datetime,
      tz,
      fmt: 'HH:mm',
    })
  )
}

export {
  addMinutesString,
  compareDayWithDateTime,
  compareOnlyTime,
  compareTimeWithDateTime,
  epochMs,
  epochSeconds,
  flexibleIsAfter,
  flexibleIsBefore,
  flexibleIsBeforeOrEqual,
  flexibleIsSameDate,
  formatAsUTC,
  formatInTimeZone,
  getDateInTz,
  makeStartAndEndTime,
  makeTimeRange,
  nextDateForDow,
  parseAsUTC,
  parseReparseUTC,
  roundTime,
}
