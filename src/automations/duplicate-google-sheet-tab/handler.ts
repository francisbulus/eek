import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '7068354e-3819-409d-81c9-ae86087efc29'
const name = 'Duplicate Google Sheet Tab'
const path = 'duplicate-google-sheet-tab'
const description = ''
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'URL or id of Source Google Sheet Document',
    description: 'The URL or id of the spreadsheet document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  tabName: {
    internalId: 2,
    name: 'Source Tab Name',
    description: 'The name of the Tab you want to duplicate',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  destinationGoogleSheetUrl: {
    internalId: 3,
    name: 'URL or id of Destination Google Sheet Document',
    description: 'The URL or id of the spreadsheet document to copy to (optional)',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  newTabName: {
    internalId: 4,
    name: 'Name of Destination Tab',
    description: 'The new name of the duplicated tab (optional). Can include template string',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  newTabId: {
    internalId: 5,
    name: 'Destination Tab Id',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  renderedNewTabName: {
    internalId: 6,
    name: 'Rendered Name of Destination Tab',
    description: 'Renders template strings',
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
