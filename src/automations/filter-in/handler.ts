import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '5146113f-f50e-4540-b55c-912e418539a6'
const name = 'Filter array of objects where the value at `field` is in `matches`'
const path = 'filter-in'
const description = 'Creates a new array of objects that match the given criteria'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Array Input',
    description: 'Input array of objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  matches: {
    internalId: 2,
    name: 'Matches',
    description: 'The list to match against',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  field: {
    internalId: 3,
    name: 'Field',
    description: 'Field to filter on',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  caseSensitive: {
    internalId: 4,
    name: 'Case Sensitive',
    description: 'Should the matching be case sensitive?',
    type: VARIABLE_TYPES.BOOLEAN,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 5,
    name: 'Filtered Array',
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
