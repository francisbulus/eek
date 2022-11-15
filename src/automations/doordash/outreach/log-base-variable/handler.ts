import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '4c5e684e-c01d-43d0-b23e-59bb46ed94fd'
const name = 'Doordash Outreach log to base variable automation'
const path = 'doordash/outreach/log-base-variable'
const description = 'Log to to baseRun variable'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  value: {
    internalId: 1,
    name: 'Current value of Base variable',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  initialValue: {
    internalId: 2,
    name: 'initial value of Base variable',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 3,
    name: 'Result of increment',
    type: VARIABLE_TYPES.STRING,
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
