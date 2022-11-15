import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'e8275fc4-27af-494e-9164-a5064c8742f0'
const name = 'Doordash Outreach append to base variable automation'
const path = 'doordash/outreach/bv-increment-value'
const description = 'Append value to baseRun variable'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  value: {
    internalId: 1,
    name: 'Current value of Base variable',
    type: VARIABLE_TYPES.NUMBER,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 2,
    name: 'Result of increment',
    type: VARIABLE_TYPES.NUMBER,
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
