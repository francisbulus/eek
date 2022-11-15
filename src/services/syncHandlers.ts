import logger from '@invisible/logger'
import { kebabCase, lowerCase, map } from 'lodash/fp'

import { ALL_HANDLERS } from '../automations'
import { nidavellir } from '../external/nidavellir'

const syncHandlers = async (upsert?: boolean) => {
  return Promise.all(
    map((handler) => {
      logger.info(`Syncing: ${handler.name}`)
      return nidavellir
        .createStepTemplate({
          ...handler,
          external: true,
          upsert: Boolean(upsert),
          meta: { ...handler.meta, path: handler.path ?? kebabCase(lowerCase(handler.name)) },
        })
        .catch(logger.error)
    }, ALL_HANDLERS)
  )
}

const syncOneHandler = async (uid: string, upsert?: boolean) => {
  const handler = ALL_HANDLERS[uid]

  if (!handler) {
    logger.error('No handler found for ${uid}')
    return
  }

  logger.info(`Syncing: ${handler.name}`)
  return nidavellir
    .createStepTemplate({
      ...handler,
      external: true,
      upsert: Boolean(upsert),
      meta: { ...handler.meta, path: handler.path ?? kebabCase(lowerCase(handler.name)) },
    })
    .catch(logger.error)
}

export { syncHandlers, syncOneHandler }
