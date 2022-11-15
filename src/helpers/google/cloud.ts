import logger from '@invisible/logger'

import { google, init } from '../../config/google'

const deleteObject = async ({ bucket, objectId }: { bucket: string; objectId: string }) => {
  await init()
  try {
    await google.storage('v1').objects.delete({ bucket, object: objectId })
  } catch (err) {
    // Most often this error will be caused if the file is not found.
    // A separate CRON job will be running a cleanup script to cleanup leftover files.
    // So no need to crash the process here or fail the Step if file is not found.
    logger.error(err)
  }
}

export { deleteObject }
