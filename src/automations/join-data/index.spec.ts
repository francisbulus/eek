import { expect } from 'chai'

import { joinData } from './index'

describe('joinData', () => {
  const setup = () => {
    const arrayInput = [
      { a: '1', b: '2', c: '3' },
      { a: '2', b: '4', c: '5' },
      { a: '5', d: '6', e: '7' },
    ]
    const arrayInput2 = [
      { a: '1', d: '2', e: '3' },
      { a: '2', d: '6', e: '7' },
      { a: '3', d: '6', e: '7' },
    ]

    const column = 'a'
    return { arrayInput, arrayInput2, column }
  }

  it('should return result of merging two arrays with a common id col', async () => {
    const { arrayInput, arrayInput2, column } = setup()

    const filtered = joinData({ arrayInput, arrayInput2, column })

    expect(filtered).to.deep.eq([
      { a: '1', b: '2', c: '3', d: '2', e: '3' },
      { a: '2', b: '4', c: '5', d: '6', e: '7' },
      { a: '5', d: '6', e: '7' },
      { a: '3', d: '6', e: '7' },
    ])
  })
})
