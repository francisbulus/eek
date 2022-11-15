import { expect } from 'chai'
import timekeeper from 'timekeeper'

import { moment, TZ } from '../../helpers/moment'
import { main } from './index'

describe('mapFields', () => {
  afterEach(() => timekeeper.reset())

  const setup = () => {
    const arrayInput = [
      { a: 'hi', b: '2', c: 'bye' },
      { a: 'asdf', b: 'fdfd', c: 'c' },
      { a: 'zzzz', b: 'xxxxx', c: 'yyyy' },
    ]

    return { arrayInput }
  }

  const destinationHeaderRow = ['h1', 'ignore 1', 'h2', 'ignore 2', 'h3', 'h4']

  // Notice that 'ignore 2' is in destinationHeaderRow but not in fieldMapping. This is OK
  const fieldMapping = {
    h1: 'c',
    h2: 'b',
    h3: 'a',
    'ignore 1': null,
    h4: '{{ currDateSheet }} - {{ a }}',
  }

  it('should remap columns, including template strings', async () => {
    timekeeper.freeze(moment.tz('2020-04-20', TZ).toDate())
    const { arrayInput } = setup()

    const actual = main({ arrayInput, destinationHeaderRow, fieldMapping })

    expect(actual).to.deep.eq([
      ['bye', '', '2', '', 'hi', '04/20/2020 - hi'],
      ['c', '', 'fdfd', '', 'asdf', '04/20/2020 - asdf'],
      ['yyyy', '', 'xxxxx', '', 'zzzz', '04/20/2020 - zzzz'],
    ])
  })

  it('should return the destination header if includeDestinationHeader === true ', async () => {
    timekeeper.freeze(moment.tz('2020-04-20', TZ).toDate())
    const { arrayInput } = setup()

    const actual = main({
      arrayInput,
      destinationHeaderRow,
      fieldMapping,
      includeDestinationHeader: true,
    })

    expect(actual).to.deep.eq([
      ['h1', 'ignore 1', 'h2', 'ignore 2', 'h3', 'h4'],
      ['bye', '', '2', '', 'hi', '04/20/2020 - hi'],
      ['c', '', 'fdfd', '', 'asdf', '04/20/2020 - asdf'],
      ['yyyy', '', 'xxxxx', '', 'zzzz', '04/20/2020 - zzzz'],
    ])
  })
})
