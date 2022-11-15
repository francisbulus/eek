import { expect } from 'chai'

import { trimInput } from './index'

describe('trim-whitespace', () => {
  const setup = () => {
    const arrayInput = [
      { name: 'Sam ', color: '       blue ', stuff: ' hi ' },
      { name: '   fds ', color: '       asdf ', stuff: ' bye ' },
    ]

    return { arrayInput }
  }

  it('should remove white spaces from all fields', async () => {
    const { arrayInput } = setup()

    const trimmed = trimInput({ arrayInput })

    expect(trimmed).to.deep.eq([
      { name: 'Sam', color: 'blue', stuff: 'hi' },
      { name: 'fds', color: 'asdf', stuff: 'bye' },
    ])
  })

  it('should remove white spaces from specified fields', async () => {
    const { arrayInput } = setup()

    const trimmed = trimInput({ arrayInput, fields: ['name', 'color'] })

    expect(trimmed).to.deep.eq([
      { name: 'Sam', color: 'blue', stuff: ' hi ' },
      { name: 'fds', color: 'asdf', stuff: ' bye ' },
    ])
  })
})
