import { expect } from 'chai'

import { flattenInput } from './index'

describe('flatten', () => {
  const setup = () => {
    const flatInput = [
      { hi: 1, bye: 2, color: 'blue' },
      { hi: 1, bye: 3, color: 'blue' },
      { hi: 2, bye: 2, color: 'red' },
      { hi: 3, bye: 1, color: 'red' },
    ]
    const arrayInput = [
      [{ hi: 1, bye: 2, color: 'blue' }],
      { hi: 1, bye: 3, color: 'blue' },
      { hi: 2, bye: 2, color: 'red' },
      { hi: 3, bye: 1, color: 'red' },
    ]
    return { arrayInput, flatInput }
  }

  it('should flatten the array', async () => {
    const { arrayInput } = setup()

    const flattened = flattenInput({ arrayInput })

    expect(flattened).to.deep.eq([
      { hi: 1, bye: 2, color: 'blue' },
      { hi: 1, bye: 3, color: 'blue' },
      { hi: 2, bye: 2, color: 'red' },
      { hi: 3, bye: 1, color: 'red' },
    ])
  })

  it('should return same array if no objects to flatten', async () => {
    const { flatInput } = setup()

    const flattened = flattenInput({ arrayInput: flatInput })

    expect(flattened).to.deep.eq(flatInput)
  })
})
