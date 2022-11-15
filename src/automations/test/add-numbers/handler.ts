import { STAGES, STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '75f16c65-8927-4edb-8d98-e7d30e5649c3'
const name = 'Add Numbers'
const path = 'test/add-numbers'
const description = 'A test step that adds two numbers'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  num1: {
    type: VARIABLE_TYPES.NUMBER,
    name: 'First number',
    stageId: STAGES.OPERATING.id,
    internalId: 1,
    required: true,
  },
  num2: {
    type: VARIABLE_TYPES.NUMBER,
    name: 'Second number',
    stageId: STAGES.OPERATING.id,
    internalId: 2,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  num3: {
    type: VARIABLE_TYPES.NUMBER,
    name: 'Sum of inputs',
    stageId: STAGES.OPERATING.id,
    internalId: 3,
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
  synchronous,
  automationLevel,
  allowRetry,
  execute,
}

export default handler
