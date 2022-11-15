import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'ef323616-5ea3-4368-9acd-147404927220'
const name = 'Update Airtable BBOT Menu Status'
const path = 'doordash/bbot/update-menu-status'
const description = 'Updating Airtable Menu Status'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  menuStatus: {
    internalId: 1,
    name: 'Menu Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  recordId: {
    internalId: 2,
    name: 'Record ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {} as const

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
