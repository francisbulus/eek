import logger from '@invisible/logger'

/**
 * For when we want to send the error up one level, where we expect it will be caught,
 * and still want to log it. All uncaught errors will be logged because of initErrorCatcher()
 */
const logAndThrow = (err: string | Error, meta?: Record<string, any>) => {
  logger.error(err instanceof Error ? err.message : err, meta)
  if (err instanceof Error) throw err
  throw new Error(err)
}

export { logAndThrow }
