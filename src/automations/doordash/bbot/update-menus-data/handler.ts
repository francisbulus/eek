import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'b86ca9d9-915f-40f4-8868-a69a2fde43dc'
const name = 'Update Airtable BBOT Menus Data'
const path = 'doordash/bbot/update-menus-data'
const description = 'Updating Airtable Menus Data'
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
  completedCsvMenu: {
    internalId: 2,
    name: 'Completed CSV Menu',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  completedCsvMenuLink: {
    internalId: 3,
    name: 'Completed CSV Menu Link',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  mxPocEmail: {
    internalId: 4,
    name: 'Mx POC Email',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  notesFromVendor: {
    internalId: 5,
    name: 'Notes from Vendor',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  recordId: {
    internalId: 6,
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
