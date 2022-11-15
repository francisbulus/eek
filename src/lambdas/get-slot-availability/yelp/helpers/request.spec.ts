import logger from '@invisible/logger'
import { expect } from 'chai'
import fs from 'fs'
import { times } from 'lodash/fp'

import { prisma } from '../../config/prisma'
import type { IValidYelpBusiness } from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'
import { yelpUrl } from './api'
import { yelpRequest } from './request'

const randomYelpBusinesses = async (n = 1) => {
  const ids = await prisma.business.findMany({
    where: { platform: PLATFORMS.YELP, cohort_id: { not: 99999999 }, id: { not: 1364 } },
    select: { id: true },
  })

  const randIds = times(() => ids[Math.floor(Math.random() * ids.length)].id, n)

  return (await prisma.business.findMany({
    where: { id: { in: randIds } },
    take: n,
  })) as IValidYelpBusiness[]
}

describe.skip('yelpRequest', () => {
  it('should perform the request', async () => {
    const biz = (await randomYelpBusinesses())[0] as IValidYelpBusiness

    const url = yelpUrl({
      business: biz,
      date: '2021-07-28',
      party_size: 4,
      time: '12:00:00',
      days_after: 5,
      num_results_after: 100,
    })

    logger.debug(url)

    const response = await yelpRequest({ url })

    fs.writeFileSync(`${__dirname}/../../ignore/yelp2.json`, JSON.stringify(response.body, null, 2))

    expect(true).to.eq(false)
  })

  it('should work', async () => {
    const url = 'http://lumtest.com/myip.json'

    const response = await yelpRequest({ url })
    logger.info(response.body)
  })
})
