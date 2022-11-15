import logger from '@invisible/logger'
import { VercelRequest, VercelResponse } from '@vercel/node'
import status from 'http-status'
import { NextApiRequest, NextApiResponse } from 'next'

import { STEP_RUN_STATUSES } from '../constants'

export const handleError = ({
  req,
  res,
  err,
}: {
  req: NextApiRequest | VercelRequest
  res: NextApiResponse | VercelResponse
  err: any
}): void => {
  logger.error(err.message, err)

  const stat = err.name === 'ValidationError' ? status.BAD_REQUEST : status.INTERNAL_SERVER_ERROR

  res.status(stat).send({
    stepRunId: req?.body?.stepRunId,
    token: req?.body?.token,
    status: STEP_RUN_STATUSES.FAILED,
    errorMessage: err.message ?? err,
    errorCode: status.BAD_REQUEST,
    stack: err.stack ?? undefined,
  })
  return
}

export class MetaError extends Error {
  public meta: any
  constructor(message = 'Validation Error', meta?: Record<string, any>) {
    super(message)
    this.name = this.constructor.name
    if (meta) this.meta = meta
    Error.captureStackTrace(this, this.constructor)
  }
}

export class MetaWarning extends MetaError {
  public meta: any
  constructor(message = 'Validation Error', meta?: Record<string, any>) {
    super(`Warn: ${message}`, meta)
  }
}

export class NotFound extends MetaWarning {
  public status = 404
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class ValidationError extends MetaWarning {
  public status = 400
  constructor(message = 'Validation Error', meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class UnauthenticatedError extends MetaWarning {
  public status = 401
  constructor(message = 'Unauthenticated Error', meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class BusinessLogicError extends MetaWarning {
  public status = 409
  constructor(message = 'Business Logic Error', meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class UserNotFoundError extends NotFound {
  public status = 404
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class ServerError extends MetaError {
  public status = 500
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class InstanceNotFoundError extends NotFound {
  public status = 404
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class RelationNotFound extends NotFound {
  constructor(message = 'Relation does not exist', meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class ResourceNotFound extends NotFound {
  public status = 404
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class InvalidRequiredArgument extends ValidationError {
  constructor(
    { name, requiredType }: { name: string; requiredType: string },
    meta?: Record<string, any>
  ) {
    super(`argument ${name} is required, and must be of type ${requiredType}`, meta)
  }
}

export class FailedServiceError extends ServerError {
  constructor(message: string, meta?: Record<string, any>) {
    super(message, meta)
  }
}

export class BusinessInstanceNotFound extends NotFound {
  constructor(
    { name, by, source }: { name: string; by: string; source?: string },
    meta?: Record<string, unknown>
  ) {
    const sourceStr = source ? `${source}: ` : ''
    super(`${sourceStr}${name} not found by the provided ${by}`, meta)
  }
}

export class ArgumentMissingRequiredKeys extends ValidationError {
  constructor({ name, keys }: any, meta?: Record<string, any>) {
    super(`Object '${name}' does not contain required key(s) ${keys}`, meta)
  }
}

let isCleaningUp = false
const cleanup = async ({
  code = 0,
  message,
  err,
}: {
  code?: number
  message?: string
  err?: Error | null | Record<string, any>
}) => {
  if (isCleaningUp) return
  else isCleaningUp = true

  if (err) logger.error((err as Error)?.message ?? message, err)
  else if (message) logger.info(message)

  logger.info('Cleaning up before exit')

  process.exit(code)
}

export const initErrorCatcher = () =>
  process.env.NODE_ENV !== 'test'
    ? process
        .on('exit', () => cleanup({ message: 'Process exited' }))
        .on('SIGINT', () => cleanup({ message: 'Process received SIGINT' }))
        .on('uncaughtException', (err) => cleanup({ code: 1, err }))
        .on('unhandledRejection', (err) => cleanup({ code: 1, err }))
    : logger.info('skipping initErrorCatcher in test')
