import { expect } from 'chai'

import { getURLsFromString } from './common'

describe('getURLsFromString', () => {
  it('should get substrings matching the url regex pattern', async () => {
    const result = getURLsFromString(
      '=HYPERLINK("https://glovoapp.com/en/bat/store/burger-king-batumi-batumi","YES")'
    )

    expect(result?.length).greaterThan(1)

    expect(result ? result[0] : null).equals(
      'https://glovoapp.com/en/bat/store/burger-king-batumi-batumi'
    )
  })
})
