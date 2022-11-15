import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '09f5531d-6d5d-41b2-9e7a-03e05ed4e4f5'
const name = 'Bolt RMP Export Automation'
const path = 'bolt/rmp/export-batch'
const description = 'Export Automation for Bolt RMP'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  restaurantBaseId: {
    internalId: 0,
    name: 'Restaurants Base ID',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  exportLink: {
    internalId: 1,
    name: 'Export Link',
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
