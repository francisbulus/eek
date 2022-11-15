import logger from '@invisible/logger'
import { PrismaClient } from 'prisma-seated'

import { PRISMA_LOGGING } from './env'
import { handleSoftDeletes } from './middlewares'

let instance: PrismaClient

const ProxyPrisma = new Proxy(PrismaClient, {
  construct(target, args) {
    if (instance) return instance
    instance = instance || new target(...args)
    handleSoftDeletes(instance)
    return instance
  },
})

const prisma = new ProxyPrisma({
  ...(PRISMA_LOGGING
    ? {
        log: [
          'info',
          `warn`,
          `error`,
          {
            emit: 'event',
            level: 'query',
          },
        ] as any[],
      }
    : {}),
})

if (PRISMA_LOGGING) {
  prisma.$on('query' as any, async (e: any) => {
    logger.debug(`${e.query}`, e.params)
  })
}

export { prisma }
