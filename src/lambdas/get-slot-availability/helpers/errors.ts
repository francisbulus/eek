import logger from '@invisible/logger'
import { includes } from 'lodash/fp'

import { FailedServiceError } from '../../../helpers/errors'

const KNOWN_CODES = [
  'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ECONNRESET',
  'EPROTO',
  'ERR_SOCKET_CLOSED',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
] as const

const handleKnownErrors = ({
  PLATFORM_NAME,
  err,
  errMeta,
}: {
  PLATFORM_NAME: string
  err: Error
  errMeta: Record<string, any>
}) => {
  if ((err as any).timeout) {
    logger.warn(`${PLATFORM_NAME}: timeout`, errMeta)
  } else if ((err as any).code === 'EMFILE') {
    throw new FailedServiceError(`${PLATFORM_NAME}: EMFILE`, errMeta)
  } else if (includes((err as any).code, KNOWN_CODES)) {
    logger.warn(`${PLATFORM_NAME}: ${(err as any).code}`, errMeta)
  } else if ((err as any)?.response?.statusCode === 503) {
    logger.warn(`${PLATFORM_NAME}: 503 Unavailable`, errMeta)
  } else if ((err as any).response?.statusCode === 403) {
    logger.warn(`${PLATFORM_NAME}: 403 Forbidden`, errMeta)
  } else if ((err as any).response?.statusCode === 500) {
    logger.warn(`${PLATFORM_NAME}: 500 Internal Server Error`, errMeta)
  } else if ((err as any).response?.statusCode && (err as any).response?.statusCode !== 200) {
    logger.warn(`${PLATFORM_NAME}: non 200 response`, errMeta)
  } else {
    logger.error(`${PLATFORM_NAME}: something wacky happened`, errMeta)
  }
}

export { handleKnownErrors }
