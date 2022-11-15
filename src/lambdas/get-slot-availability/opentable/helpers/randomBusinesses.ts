import { times } from 'lodash/fp'

import { prisma } from '../../config/prisma'
import type { IValidOpentableBusiness } from '../../helpers/types'
import { PLATFORMS } from '../../helpers/types'

const randomOpentableBusinesses = async (n = 1) => {
  const ids = await prisma.business.findMany({
    where: { platform: PLATFORMS.OPENTABLE, cohort_id: { not: 99999999 } },
    select: { id: true },
  })

  const randIds = times(() => ids[Math.floor(Math.random() * ids.length)].id, n)

  return (await prisma.business.findMany({
    where: { id: { in: randIds } },
    take: n,
  })) as IValidOpentableBusiness[]
}

export { randomOpentableBusinesses }
