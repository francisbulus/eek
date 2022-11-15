import { expect } from 'chai'

import { titleCaseInput } from './index'

describe('title-case', () => {
  const setup = () => {
    const arrayInput = [
      { name: 'bob smith', age: '30', phrase: 'Hello World' },
      { name: 'dwayne Johnson', age: '45', phrase: 'if you smEll what the ROCK is cooking' },
      { name: 'Ric Flair', age: '60', phrase: 'wooOOOoooOOo WOOooOOOoo' },
    ]

    return { arrayInput }
  }

  it('should title case a given field for all objects in an array', async () => {
    const { arrayInput } = setup()
    const field1 = 'name'
    const field2 = 'phrase'

    const formatted1 = titleCaseInput({ arrayInput, fields: [field1] })

    expect(formatted1).to.deep.eq([
      { name: 'Bob Smith', age: '30', phrase: 'Hello World' },
      { name: 'Dwayne Johnson', age: '45', phrase: 'if you smEll what the ROCK is cooking' },
      { name: 'Ric Flair', age: '60', phrase: 'wooOOOoooOOo WOOooOOOoo' },
    ])

    const formatted2 = titleCaseInput({ arrayInput, fields: [field2] })

    expect(formatted2).to.deep.eq([
      { name: 'bob smith', age: '30', phrase: 'Hello World' },
      { name: 'dwayne Johnson', age: '45', phrase: 'If You Smell What The Rock Is Cooking' },
      { name: 'Ric Flair', age: '60', phrase: 'Wooooooooooo Wooooooooo' },
    ])
  })

  it('should not adjust the value of a field if it is not a string', async () => {
    const arrayInput: any = []
    const field = 'age'

    const formatted = titleCaseInput({ arrayInput, fields: [field] })

    expect(formatted).to.deep.eq(arrayInput)
  })

  it('should return an empty array if array has nothing passed in', async () => {
    const arrayInput: any = []
    const field = 'name'

    const formatted = titleCaseInput({ arrayInput, fields: [field] })

    expect(formatted).to.deep.eq([])
  })

  it('should titleize every field if no fields passed in', async () => {
    const { arrayInput } = setup()

    const formatted = titleCaseInput({ arrayInput })

    expect(formatted).to.deep.eq([
      { name: 'Bob Smith', age: '30', phrase: 'Hello World' },
      { name: 'Dwayne Johnson', age: '45', phrase: 'If You Smell What The Rock Is Cooking' },
      { name: 'Ric Flair', age: '60', phrase: 'Wooooooooooo Wooooooooo' },
    ])
  })
})
