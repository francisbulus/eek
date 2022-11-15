import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '270039c4-1a3d-4f26-b74c-af17a72a6275'
const name = 'Flatten Array of Objects'
const path = 'flatten'
const description = 'Creates a new array of objects that match the given criteria'
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
    name: 'Flattened Array',
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
