import { NowRequest } from '@vercel/node'
import * as yup from 'yup'

import { ValidationError } from './errors'

const stepRunIdSchema = yup.lazy((value) => {
  switch (typeof value) {
    case 'number':
      return yup.number().required().positive().integer()
    case 'string':
      return yup.string().uuid().required()
    default:
      throw new ValidationError('StepRunId must be either a number or a uuid string')
  }
})

const basics = {
  stepRunId: stepRunIdSchema,
  token: yup.string().optional(),
}

const basicInputSchema = yup.object(basics).required()

const validateBasics = (req: NowRequest) => {
  const { body } = req
  return basicInputSchema.validateSync(body)
}

export { basicInputSchema, validateBasics }
