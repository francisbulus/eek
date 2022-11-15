import { expect } from 'chai'

import { pickFields } from './index'

describe('pick fields', () => {
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

  it('should filter the data and remove duplicates based on given fields', async () => {
    const { arrayInput } = setup()

    const picked = pickFields({ arrayInput, fields: ['Header 1'] })
    const picked2 = pickFields({ arrayInput, fields: ['Header 1', 'Header 2'] })

    expect(picked).to.deep.eq([
      { 'Header 1': 'data 1' },
      { 'Header 1': 'data 1' },
      { 'Header 1': 'data 2' },
      { 'Header 1': '' },
      { 'Header 1': '' },
    ])

    expect(picked2).to.deep.eq([
      { 'Header 1': 'data 1', 'Header 2': 'data 2' },
      { 'Header 1': 'data 1', 'Header 2': 'data 2' },
      { 'Header 1': 'data 2', 'Header 2': 'data 4' },
      { 'Header 1': '', 'Header 2': '' },
      { 'Header 1': '', 'Header 2': 'data 6' },
    ])
  })
})
