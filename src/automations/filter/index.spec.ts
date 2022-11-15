import { expect } from 'chai'

import { filterInput } from './index'

/**
 * Note, since filters are exact match, we expect all strings. 1 does not equal '1'
 */
describe('filter', () => {
  const setup = () => {
    const arrayInput = [
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '1', bye: '3', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ]

    return { arrayInput }
  }

  it('should filter the array based on the filter passed in', async () => {
    const { arrayInput } = setup()

    const filtered = filterInput({ arrayInput, filters: { hi: '1' } })

    expect(filtered).to.deep.eq([
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '1', bye: '3', color: 'blue' },
    ])
  })

  it('should filter with multiple filters', async () => {
    const { arrayInput } = setup()

    const filtered = filterInput({ arrayInput, filters: { hi: '1', bye: '3' } })

    expect(filtered).to.deep.eq([{ hi: '1', bye: '3', color: 'blue' }])
  })

  it('should return empty array if no filters match', async () => {
    const { arrayInput } = setup()

    const filtered = filterInput({ arrayInput, filters: { hi: '1', bye: '5' } })

    expect(filtered).to.deep.eq([])
  })
})
