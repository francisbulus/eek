import { expect } from 'chai'

import { filterInput } from './index'

describe('filter-in', () => {
  const setup = () => {
    const arrayInput = [
      { name: 'John', city: 'Lagos' },
      { name: 'Frank', city: 'London' },
      { name: 'Mike', city: 'New York' },
      { name: 'Alex', city: 'Dubai' },
    ]

    return { arrayInput }
  }

  it('should filter the array based on the matches and field (case insensitive)', async () => {
    const { arrayInput } = setup()

    const filtered = filterInput({ arrayInput, matches: ['john', 'frank'], field: 'name' })

    expect(filtered).to.deep.eq([
      { name: 'John', city: 'Lagos' },
      { name: 'Frank', city: 'London' },
    ])
  })

  it('should filter the array based on the matches and field (case sensitive)', async () => {
    const { arrayInput } = setup()

    const filtered = filterInput({
      arrayInput,
      matches: ['John', 'frank'],
      field: 'name',
      caseSensitive: true,
    })

    expect(filtered).to.deep.eq([{ name: 'John', city: 'Lagos' }])
  })
})
