import { times } from 'lodash/fp'

import { prisma } from '../../config/prisma'
import type { IValidResyBusiness } from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'

const randomResyBusinesses = async (n = 1) => {
  const ids = await prisma.business.findMany({
    where: { platform: PLATFORMS.RESY, cohort_id: { not: 99999999 } },
    select: { id: true },
  })

  const randIds = times(() => ids[Math.floor(Math.random() * ids.length)].id, n)

  return (await prisma.business.findMany({
    where: { id: { in: randIds } },
    take: n,
  })) as IValidResyBusiness[]
}

export { randomResyBusinesses }
