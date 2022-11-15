import { expect } from 'chai'

import { removeEmpty } from './index' //main helper function

describe('remove-empty', () => {
  const setup = () => {
    const emptyRowInput = [
      {},
      { hi: '1', bye: '3', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ]

    const emptyValueInput = [
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '', bye: '', color: '' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ]

    return { emptyRowInput, emptyValueInput }
  }

  it('should remove a blank row', async () => {
    const { emptyRowInput } = setup()

    const filtered = removeEmpty({ arrayInput: emptyRowInput })

    expect(filtered).to.deep.eq([
      { hi: '1', bye: '3', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ])
  })

  it('should remove a row with empty values', async () => {
    const { emptyValueInput } = setup()

    const filtered = removeEmpty({ arrayInput: emptyValueInput })

    expect(filtered).to.deep.eq([
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ])
  })

  it('should do nothing if no empty objects', async () => {
    const filtered = removeEmpty({
      arrayInput: [
        { hi: '1', bye: '2', color: 'blue' },
        { hi: '2', bye: '2', color: 'red' },
        { hi: '3', bye: '1', color: 'red' },
      ],
    })

    expect(filtered).to.deep.eq([
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ])
  })
})
