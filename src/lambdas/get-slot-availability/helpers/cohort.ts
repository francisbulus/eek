import { prisma } from '../config/prisma'

const getLatestCohortForExternalId = async (external_id: number) =>
  prisma.cohort.findFirst({
    where: { external_id, archived_at: null },
    orderBy: { id: 'desc' },
  })

export { getLatestCohortForExternalId }
