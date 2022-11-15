import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'ab583e9d-ca3f-4388-a42d-99a639ac8134'
const name = 'Sort Array of Objects'
const path = 'sort-by'
const description = 'Creates a new array of objects that match the given criteria'
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
    description: 'Fields to sort by',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  order: {
    internalId: 3,
    name: 'Order',
    description:
      'Sort order (asc | desc). One entry per field. Order matters. Defaults to asc for all',
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
