import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'def720d4-f915-40a3-bd63-e37113272381'
const name = 'Update Airtable BBOT Print Status'
const path = 'doordash/bbot/update-print-status'
const description = 'Updating Airtable Print Status'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  printFileStatus: {
    internalId: 1,
    name: 'Print File Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  recordID: {
    internalId: 2,
    name: 'Record ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  finalPrintFile: {
    internalId: 3,
    name: 'Final Print File',
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
