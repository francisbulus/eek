import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'efe12a9f-d2c5-43b5-8240-9a26d9eb2a11'
const name = 'Format Array of Strings to Title Case'
const path = 'title-case'
const description = 'Creates a new array of strings that are in title case'
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
  field: {
    internalId: 2,
    name: 'Fields',
    description: 'Fields to be title cased',
    type: VARIABLE_TYPES.ARR_STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 3,
    name: 'Title cased output',
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
