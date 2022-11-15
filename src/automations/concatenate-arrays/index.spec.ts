import { expect } from 'chai'

import { concatenateInput } from './index'

describe('concatenate', () => {
  const setup = () => {
    const inputArray1 = [
      { name: 'John', city: 'Lagos' },
      { name: 'Frank', city: 'London' },
    ]

    const inputArray2 = [
      { name: 'Mike', city: 'New York' },
      { name: 'Alex', city: 'Dubai' },
    ]

    return { inputArray1, inputArray2 }
  }

  it('should concatenate the input arrays', async () => {
    const { inputArray1, inputArray2 } = setup()

    const output = concatenateInput({ inputArray1, inputArray2 })

    expect(output).to.deep.equal([
      { name: 'John', city: 'Lagos' },
      { name: 'Frank', city: 'London' },
      { name: 'Mike', city: 'New York' },
      { name: 'Alex', city: 'Dubai' },
    ])
  })
})
