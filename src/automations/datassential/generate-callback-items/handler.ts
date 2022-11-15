import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '885c1f27-528a-437d-93cb-89058f4e1b02'
const name = 'Datassential Generate Callback Items'
const path = 'datassential/generate-callback-items'
const description = 'An automation to generate callback items for a particular restaurant.'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  autoInput: {
    internalId: 1,
    name: 'Automation Input',
    type: VARIABLE_TYPES.ANY,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 2,
    name: 'Callback Items',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: false,
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
