import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '4598db1f-158b-43f5-b7bc-c29f16eb5f0f'
const name = 'Remove Empty'
const path = 'remove-empty'
const description =
  'Remove empty objects from array (including objects that have all undefined values)'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Array Input',
    description: 'Array of objects',
    type: VARIABLE_TYPES.ARR_ANY,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 2,
    name: 'Filtered Output',
    type: VARIABLE_TYPES.ARR_ANY,
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
