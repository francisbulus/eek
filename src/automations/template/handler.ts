import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '88bf9f4a-aab9-443a-a928-2bc3b42879de'
const name = 'Pipe'
const path = 'template'
const description = 'A test step that outputs whatever is inputs'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  pipeInput: {
    internalId: 1,
    name: 'Pipe input',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  pipeOutput: {
    internalId: 2,
    name: 'Pipe output',
    type: VARIABLE_TYPES.STRING,
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
