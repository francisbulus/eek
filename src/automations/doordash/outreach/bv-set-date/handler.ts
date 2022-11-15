import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'ae2c27b9-e6c1-4ba3-9f4a-d9a79f7a59b2'
const name = 'Doordash Outreach set base variable to current date automation'
const path = 'doordash/outreach/bv-set-date'
const description = 'set base variable to current date'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = null

const outputs: TInputsOutputs = {
  data: {
    internalId: 1,
    name: 'Current data time in string',
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
