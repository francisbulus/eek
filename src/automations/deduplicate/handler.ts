import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '1c237f6e-84e7-4b06-a117-d7cdfbab8e06'
const name = 'Deduplicate Array of Objects'
const path = 'deduplicate'
const description = 'Remove duplicates from array of objects'
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
    description: 'Optional array of fields to dedupe by',
    type: VARIABLE_TYPES.ARR_STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 3,
    name: 'Deduplicated Output',
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
