import { expect } from 'chai'

import { businessPath } from './redis'

describe('businessPath', () => {
  it('should generate the business path in redis', async () => {
    const actual = businessPath({ batch_id: 123, external_id: 678, cohort_external_id: 482 })
    const expected = 'batch/123/cohort/482/business/678'

    expect(actual).to.eq(expected)
  })
})
