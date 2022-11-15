import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '0a737b58-69b9-4c50-8c50-039aa3bfa8b2'
const name = 'Update Airtable BBOT Print Data'
const path = 'doordash/bbot/update-print-data'
const description = 'Updating Airtable Print Data'
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
  finalPrintFile: {
    internalId: 2,
    name: 'Final Print File',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  notesFromVendor: {
    internalId: 3,
    name: 'Notes from Vendor',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  recordID: {
    internalId: 4,
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
