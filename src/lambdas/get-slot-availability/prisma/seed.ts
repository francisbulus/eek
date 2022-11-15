import logger from '@invisible/logger'

import { NODE_ENV } from '../config/env'
import { seedAll } from './seedHelpers'

if (NODE_ENV === 'test') {
  // do nothing
} else if (NODE_ENV === 'production') {
  throw new Error("Don't call the seed in production!")
} else {
  seedAll()
    .then((obj: Record<string, any>) => {
      logger.info(obj)
      process.exit()
    })
    .catch((err) => {
      logger.error(err)
      throw err
    })
}
