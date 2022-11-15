import { flow, join, pick, random, times, uniqBy } from 'lodash/fp'

const uniqByFields = <T extends Record<string, any>>({
  arrayInput,
  fields,
}: {
  arrayInput: T[]
  fields: string[]
}) => uniqBy((item: T) => JSON.stringify(pick(fields, item)), arrayInput)

const alphaNumericString = flow(times(flow(random(35), (num) => num.toString(36))), join(''))

export { alphaNumericString, uniqByFields }
