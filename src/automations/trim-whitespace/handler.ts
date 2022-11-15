import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '58af1fab-f587-4e88-a553-9f16f6175571'
const name = 'Trim Whitespace'
const path = 'trim-whitespace'
const description = 'Trims leading and ending whitespace from specified fields'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Array Input',
    description: 'Array of objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  fields: {
    internalId: 2,
    name: 'Fields',
    description: 'Fields to trim. If no fields specified, will trim all fields',
    type: VARIABLE_TYPES.ARR_STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 3,
    name: 'Array Output',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
} as const

const handler: IAutomationHandler<typeof inputs, typeof outputs> = {
  uid,
  name,
  path,
  description,
  inputs,
  outputs,
  allowRetry,
  synchronous,
  automationLevel,
  execute,
} as const

export default handler
