import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'bf6b5900-4d68-452a-bbab-7ac43bfa1675'
const name = 'Rappi Priority Parter Calling & Data Enrichment Order Update Automation'
const path = 'rappi/priority-partner-calling/update-order-number'
const description = 'An automation that updates the number of accumulated orders of a restaurant'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  storeId: {
    internalId: 1,
    name: 'Store ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  sobOrOutb: {
    internalId: 2,
    name: 'SOB or OUTB',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  numberOfOrders: {
    internalId: 3,
    name: 'Number of Orders',
    type: VARIABLE_TYPES.NUMBER,
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
