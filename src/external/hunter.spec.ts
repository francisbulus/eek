import { expect } from 'chai'
import { filter } from 'lodash'

import { getEmailsForDomains, getEmailsForFinder, verifyEmails } from './hunter'

xdescribe('hunter', () => {
  describe('getEmailsForDomains', () => {
    const setup = () => {
      const table = [{ domain: 'invisible.email' }, { domain: 'intercom.io' }]

      return { table }
    }

    it('should call hunter.io', async () => {
      const { table } = setup()
      const emails = await getEmailsForDomains({ table })
      const pieterEmail = filter(emails, (e) => e.value === 'pieter@invisible.email')
      expect(pieterEmail.length).to.equal(1)
    })
  })

  describe('getEmailsForFinder', () => {
    const setup = () => {
      const table = [
        {
          first_name: 'Francis',
          last_name: 'Pedraza',
          domain: 'invisible.email',
          company: 'inv.tech',
        },
        {
          first_name: 'Dilip',
          last_name: 'Malave',
          domain: 'invisible.email',
          company: 'inv.tech',
        },
        {
          first_name: 'Scott',
          last_name: 'Downes',
          domain: 'invisible.email',
          company: 'inv.tech',
        },
      ]

      return { table }
    }

    it('should call hunter.io', async () => {
      const { table } = setup()

      const emails = await getEmailsForFinder(table)
      const francisEmail = filter(emails, (e) => e.email === 'francis@invisible.email')
      expect(francisEmail.length).to.equal(1)
    })
  })

  describe('verifyEmails', () => {
    const setup = () => {
      const table = [
        { email: 'francis@invisible.email' },
        { email: 'sam@invisible.email' },
        { email: 'N/A' },
      ]

      return { table }
    }

    it('should call hunter.io', async () => {
      const { table } = setup()

      const emails = await verifyEmails({ table })
      const francisEmail = filter(emails, (e) => e.email === 'francis@invisible.email')
      expect(francisEmail.length).to.equal(1)
    })
  })
})
