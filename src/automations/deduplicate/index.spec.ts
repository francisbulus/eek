import { expect } from 'chai'

import { deDuplicateInput } from './index'

describe('deduplicate', () => {
  const setup = () => {
    const arrayInput = [
      {
        'Header 1': 'data 1',
        'Header 2': 'data 2',
        'Header 3': 'data 3',
      },
      {
        'Header 1': 'data 1',
        'Header 2': 'data 2',
        'Header 3': 'data 3',
      },
      {
        'Header 1': 'data 2',
        'Header 2': 'data 4',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': '',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': 'data 6',
        'Header 3': 'data 4',
      },
    ]
    return { arrayInput }
  }

  it('should filter the data and remove exact duplicates when no fields specified', async () => {
    const { arrayInput } = setup()

    const filtered = deDuplicateInput({ arrayInput })

    expect(filtered).to.deep.eq([
      {
        'Header 1': 'data 1',
        'Header 2': 'data 2',
        'Header 3': 'data 3',
      },
      {
        'Header 1': 'data 2',
        'Header 2': 'data 4',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': '',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': 'data 6',
        'Header 3': 'data 4',
      },
    ])
  })

  it('should filter the data and remove duplicates based on given fields', async () => {
    const { arrayInput } = setup()

    const filtered = deDuplicateInput({ arrayInput, fields: ['Header 1'] })
    const filtered2 = deDuplicateInput({ arrayInput, fields: ['Header 1', 'Header 2'] })

    expect(filtered).to.deep.eq([
      {
        'Header 1': 'data 1',
        'Header 2': 'data 2',
        'Header 3': 'data 3',
      },
      {
        'Header 1': 'data 2',
        'Header 2': 'data 4',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': '',
        'Header 3': 'data 3',
      },
    ])

    expect(filtered2).to.deep.eq([
      {
        'Header 1': 'data 1',
        'Header 2': 'data 2',
        'Header 3': 'data 3',
      },
      {
        'Header 1': 'data 2',
        'Header 2': 'data 4',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': '',
        'Header 3': 'data 3',
      },
      {
        'Header 1': '',
        'Header 2': 'data 6',
        'Header 3': 'data 4',
      },
    ])
  })
})
