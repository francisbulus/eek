import { expect } from 'chai'

import { groupInput } from './index'

describe('group', () => {
  const setup = () => {
    const arrayInput = [
      { hi: '1', bye: '2', color: 'blue' },
      { hi: '1', bye: '3', color: 'blue' },
      { hi: '2', bye: '2', color: 'red' },
      { hi: '3', bye: '1', color: 'red' },
    ]

    return { arrayInput }
  }

  it('should group the array based on the field passed in', async () => {
    const { arrayInput } = setup()
    const field = 'hi'

    const grouped = groupInput({ field, arrayInput })

    expect(grouped).to.deep.eq({
      '1': [
        { hi: '1', bye: '2', color: 'blue' },
        { hi: '1', bye: '3', color: 'blue' },
      ],
      '2': [{ hi: '2', bye: '2', color: 'red' }],
      '3': [{ hi: '3', bye: '1', color: 'red' }],
    })
  })

  it('should return the original object grouped into a key of "false" if no field groups match', async () => {
    const { arrayInput } = setup()
    const field = 'asdf' // always undefined

    const grouped = groupInput({ field, arrayInput })

    expect(grouped).to.deep.eq({
      undefined: arrayInput,
    })
  })
})
