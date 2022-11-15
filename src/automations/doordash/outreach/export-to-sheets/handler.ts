import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'b6e8f1fa-0520-4a28-a8ec-57e33602c573'
const name = 'Doordash Outreach export to sheets automation'
const path = 'doordash/outreach/export-to-sheets'
const description = 'Export to sheets'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  driveFolderKey: {
    internalId: 1,
    name: 'Drive Folder ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  keyIds: {
    internalId: 2,
    name: 'The list of the variables',
    type: VARIABLE_TYPES.OBJECT,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 3,
    name: 'Export sheet link',
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
