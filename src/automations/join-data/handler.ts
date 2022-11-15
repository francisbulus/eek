import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '03b9bc6e-87f7-42f3-9bc0-8a75027f7788'
const name = 'Join Data'
const path = 'joinData'
const description = 'Join data of two arrays based on a specified column'
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
  arrayInput2: {
    internalId: 2,
    name: 'Second Array Input',
    description: 'Second Array of objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  column: {
    internalId: 3,
    name: 'Column',
    description: 'Id column on which to join the two arrays',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 4,
    name: 'The outer join of the two arrays of objects',
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
