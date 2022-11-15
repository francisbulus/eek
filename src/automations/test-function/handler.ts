import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '55bf423a-5169-12ec-92e6-0221ad211211'
const name = 'Test Function 9'
const path = 'test-function'
const description = 'A test function'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true
const usesGenerator = true

const inputs: TInputsOutputs = {} as const

const outputs: TInputsOutputs = {
  test: {
    internalId: 1,
    name: 'Test Variable 4',
    type: VARIABLE_TYPES.STRING,
    required: true,
    stage: 'build',
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
  usesGenerator,
  execute,
} as const

export default handler
