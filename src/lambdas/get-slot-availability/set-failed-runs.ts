import logger from '@invisible/logger'
import * as dateFns from 'date-fns'
import { scrape_statuses } from 'prisma-seated'

import { prisma } from './config/prisma'

const init = async () =>
  prisma.run.updateMany({
    data: { scrape_status: scrape_statuses.failure },
    where: {
      scrape_status: scrape_statuses.processing,
      created_at: { lt: dateFns.addMinutes(new Date(), -15) },
    },
  })

init().then((a: any) => {
  logger.debug('set-failed-runs done', a)
  process.exit(0)
})
