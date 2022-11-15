import logger from '@invisible/logger'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { runMulti } from './multi-helper'

const init = async () => {
  const argv: any = yargs(hideBin(process.argv)).argv

  if (!argv.cohort_external_id) {
    logger.info(`No cohort_external_id passed in, exiting`)
    return
  }

  logger.info(new Date())
  logger.info(argv)

  return runMulti({
    cohort_external_id: argv.cohort_external_id,
    check_dow: argv.check_dow,
    check_time: argv.check_time,
    sendToSeated: argv.sendToSeated,
    test_mode: argv.test_mode,
    external_ids: argv.external_ids,
    functionConcurrency: argv.functionConcurrency,
    businessesPerFunction: argv.businessesPerFunction,
    limit: argv.limit,
    addDays: argv.addDays,
  })
    .then((a) => {
      logger.info(`runMulti result`, a)
      logger.info(new Date())
      process.exit(0)
    })
    .catch((err) => {
      logger.error(err)
      logger.info(new Date())
      process.exit(1)
    })
}

init().then((a: any) => {
  logger.debug(a)
  process.exit(0)
})
