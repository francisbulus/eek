import moment from 'moment-timezone'

require('moment-duration-format')(moment)

const TZ = 'America/Los_Angeles'
const DATE_FOR_SHEET = 'MM/DD/YYYY'
const DATE_FOR_TAB_NAME = 'MMDDYYYY'
const LONG_FORMAT = 'MMMM Do YYYY, hh:mmA z'

export { DATE_FOR_SHEET, DATE_FOR_TAB_NAME, LONG_FORMAT, moment, TZ }
