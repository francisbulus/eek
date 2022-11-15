import logger from '@invisible/logger'
import yargs from 'yargs'

import { syncHandlers } from '../src/services/syncHandlers'

const upsert = Boolean((yargs.argv as any).upsert)

syncHandlers(upsert).then(logger.info)
