import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'a5772ffe-8cda-40bb-84c6-950c27f15528'
const name = 'Pick fields'
const path = 'pick-fields'
const description = 'Get an array of objects of only the given fields from an array of objects'
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
    description: 'Fields to pick',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
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
