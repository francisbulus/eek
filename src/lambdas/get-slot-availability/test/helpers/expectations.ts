import { expect } from 'chai'

import { flexibleIsSameDate } from '../../helpers/date'

const expectSameDate = (a?: string | Date | null, b?: string | Date | null) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return expect(flexibleIsSameDate(a, b)).to.eq(true, `Dates are not the same: ${a} ${b}`)
}

export { expectSameDate }
