import { expect } from 'chai'

import { validateAddresses } from '../../external/address-validator'

describe.skip('address-validator', function () {
  const setup = () => {
    const arrayInput = [
      {
        'Unvalidated Address': '1320 Kershaw Loop - Unit 210, Fayatteville, NC 28314',
      },
      {
        'Unvalidated Address': "132 O'Neil St, Kingston, NY 12401,",
      },
      {
        'Unvalidated Address': '159 Desimone Dr, Maryville, TN 37801',
      },
      {
        'Unvalidated Address': '2097 County Route 1, Westtown, NY 10998',
      },
    ]

    const arrayOutput = [
      {
        'Unvalidated Address': '1320 Kershaw Loop - Unit 210, Fayatteville, NC 28314',
        Status: 'Valid',
        'Formatted Address': '1320 Kershaw Loop Apartment 210, Fayetteville, NC 28314, USA',
      },
      {
        'Unvalidated Address': "132 O'Neil St, Kingston, NY 12401,",
        Status: 'Valid',
        'Formatted Address': '132 Oneil Street, Kingston, NY 12401, USA',
      },
      {
        'Unvalidated Address': '159 Desimone Dr, Maryville, TN 37801',
        Status: 'Valid',
        'Formatted Address': '159 Desimone District, Maryville, TN 37801, USA',
      },
      {
        'Unvalidated Address': '2097 County Route 1, Westtown, NY 10998',
        Status: 'Invalid',
        'Formatted Address': 'County Route 1, Warwick, NY 10990, USA',
      },
    ]
    return { arrayInput, arrayOutput }
  }

  const invalidSetup = () => {
    const arrayInput = [
      { 'Unvalidated Address': 'N' },
      { 'Unvalidated Address': 'Douala, Cameroon' },
      { 'Unvalidated Address': 'Miami, FL' },
      { 'Unvalidated Address': 'New York' },
      { 'Unvalidated Address': '@34075#$' },
    ]
    const arrayOutput = [
      { 'Unvalidated Address': 'N', Status: 'Invalid', 'Formatted Address': 'Not Found' },
      {
        'Unvalidated Address': 'Douala, Cameroon',
        Status: 'Invalid',
        'Formatted Address': 'Not Found',
      },
      { 'Unvalidated Address': 'Miami, FL', Status: 'Invalid', 'Formatted Address': 'Not Found' },
      { 'Unvalidated Address': 'New York', Status: 'Invalid', 'Formatted Address': 'Not Found' },
      { 'Unvalidated Address': '@34075#$', Status: 'Invalid', 'Formatted Address': 'Not Found' },
    ]
    return { arrayInput, arrayOutput }
  }

  it('should validate given addresses', async function () {
    const { arrayInput, arrayOutput } = setup()
    expect(
      await validateAddresses({
        arrayInput,
      })
    ).to.deep.eq(arrayOutput)
  })

  it('should not validate addresses because of bad format', async function () {
    const { arrayInput, arrayOutput } = invalidSetup()
    expect(
      await validateAddresses({
        arrayInput,
      })
    ).to.deep.eq(arrayOutput)
  })
})
