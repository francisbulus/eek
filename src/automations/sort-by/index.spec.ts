import { expect } from 'chai'

import { sortByInput } from './index'

describe('sortBy', () => {
  const setup = () => {
    const arrayInput = [
      { user: 'fred', age: '1' },
      { user: 'creg', age: '100' },
      { user: 'dav', age: '2' },
      { user: 'barney', age: '4' },
      { user: 'barney', age: '3' },
    ]
    return { arrayInput }
  }

  it('should sort the array based on the field passed in', async () => {
    const { arrayInput } = setup()

    const sortedBy = sortByInput({ arrayInput, fields: ['user'] })

    expect(sortedBy).to.deep.eq([
      { user: 'barney', age: '4' },
      { user: 'barney', age: '3' },
      { user: 'creg', age: '100' },
      { user: 'dav', age: '2' },
      { user: 'fred', age: '1' },
    ])
  })

  it('should sort the array with multiple fields', async () => {
    const { arrayInput } = setup()

    const sortedBy = sortByInput({ arrayInput, fields: ['user', 'age'] })

    expect(sortedBy).to.deep.eq([
      { user: 'barney', age: '3' },
      { user: 'barney', age: '4' },
      { user: 'creg', age: '100' },
      { user: 'dav', age: '2' },
      { user: 'fred', age: '1' },
    ])
  })

  it('should sort the array with field and order', async () => {
    const { arrayInput } = setup()

    const sortedBy = sortByInput({ arrayInput, fields: ['user', 'age'], order: ['desc'] })

    expect(sortedBy).to.deep.eq([
      { user: 'fred', age: '1' },
      { user: 'dav', age: '2' },
      { user: 'creg', age: '100' },
      { user: 'barney', age: '3' },
      { user: 'barney', age: '4' },
    ])
  })

  it('should sort based on the parsed number values if numbers', async () => {
    const { arrayInput } = setup()

    const sortedBy = sortByInput({ arrayInput, fields: ['age'] })

    expect(sortedBy).to.deep.eq([
      { user: 'fred', age: '1' },
      { user: 'dav', age: '2' },
      { user: 'barney', age: '3' },
      { user: 'barney', age: '4' },
      { user: 'creg', age: '100' },
    ])
  })
})
