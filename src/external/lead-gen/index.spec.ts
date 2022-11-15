import { expect } from 'chai'
import { v4 } from 'uuid'

import { getNamesAndRolesForDomains } from '.'

describe('lead-gen', () => {
  describe('getNamesAndRolesForDomains', () => {
    const setup = () => {
      const table = [
        { domain_name: 'invisible.email', company_name: 'Invisible Technologies' },
        { domain_name: 'stripe.com', company_name: 'Stripe' },
      ]

      return { table }
    }

    it('should get names and roles for Domains', async () => {
      const { table } = setup()
      const stepRunId = v4()
      const token = v4()
      const status = await getNamesAndRolesForDomains(stepRunId, token, { table })
      expect(status).to.eq(200)
    })
  })
})
