import { expect } from 'chai'

import { chunkInput } from './index'

describe('filter', () => {
  const setup = () => {
    const arrayInput = [
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '1', bye: '3', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
      { hi: '4', bye: '1', color: 'red' },
      { hi: '5', bye: '1', color: 'red' },
    ]

    return { arrayInput }
  }

  it('should split up the array into chunks of size n', async () => {
    const { arrayInput } = setup()

    const actual = chunkInput({ arrayInput, chunkSize: 2 })

    expect(actual).to.deep.eq([
      [
        { hi: '1', bye: '2', color: 'blue' },
        { hi: '1', bye: '3', color: 'blue' },
      ],
      [
        { hi: '2', bye: '2', color: 'red' },
        { hi: '3', bye: '1', color: 'red' },
      ],
      [
        { hi: '4', bye: '1', color: 'red' },
        { hi: '5', bye: '1', color: 'red' },
      ],
    ])
  })

  it('should split up the array into chunks of size at most n', async () => {
    const { arrayInput } = setup()

    const actual = chunkInput({ arrayInput, chunkSize: 4 })

    expect(actual).to.deep.eq([
      [
        { hi: '1', bye: '2', color: 'blue' },
        { hi: '1', bye: '3', color: 'blue' },
        { hi: '2', bye: '2', color: 'red' },
        { hi: '3', bye: '1', color: 'red' },
      ],
      [
        { hi: '4', bye: '1', color: 'red' },
        { hi: '5', bye: '1', color: 'red' },
      ],
    ])
  })

  it('should work if chunkSize > length of array', async () => {
    const { arrayInput } = setup()

    const actual = chunkInput({ arrayInput, chunkSize: 10 })

    expect(actual).to.deep.eq([
      [
        { hi: '1', bye: '2', color: 'blue' },
        { hi: '1', bye: '3', color: 'blue' },
        { hi: '2', bye: '2', color: 'red' },
        { hi: '3', bye: '1', color: 'red' },
        { hi: '4', bye: '1', color: 'red' },
        { hi: '5', bye: '1', color: 'red' },
      ],
    ])
  })
})
