import logger from '@invisible/logger'
import yargs from 'yargs'

import { syncOneHandler } from '../src/services/syncHandlers'

const upsert = Boolean((yargs.argv as any).upsert)
const uid = (yargs.argv as any).uid

syncOneHandler(uid, upsert).then(logger.info)
