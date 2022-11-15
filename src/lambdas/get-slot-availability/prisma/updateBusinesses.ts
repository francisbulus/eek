import logger from '@invisible/logger'

import { updateBusinesses, updateBusinessesSeedFile } from './updateBusinessesHelper'

const init = async () => {
  const result = await updateBusinesses()
  logger.info(result)
  await updateBusinessesSeedFile()
}

init().then(() => {
  process.exit(0)
})
