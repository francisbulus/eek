import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '0eb42851-d2ac-4c25-884d-280ad22ffa4b'
const name = 'Doordash Outreach Inflation Pricing Import Sheet Automation'
const path = 'doordash/pi/import-sheet'
const description = 'Import Sheet Data for Doordash Outreach Inflation Pricing Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  sheetUrl: {
    internalId: 1,
    name: 'Google Sheet Url',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  sheetTab: {
    internalId: 2,
    name: 'Google Sheet Tab',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  sla: {
    internalId: 3,
    name: 'Time to Complete',
    type: VARIABLE_TYPES.NUMBER,
    required: false,
  },
  description: {
    internalId: 4,
    name: 'Description',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 5,
    name: 'Data rows contained in sheet',
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
