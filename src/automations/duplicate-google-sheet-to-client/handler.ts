import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'd092345f-c751-4817-accb-3e51a88bd799'
const name = 'Rename and Deliver Google Sheet to Client'
const path = 'duplicate-google-sheet-to-client'
const description = 'Duplicate a Google Sheet and move it to the destination folder'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'URL or id of Google Sheet Document to duplicate',
    description: 'The URL or id of the spreadsheet document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  clientName: {
    internalId: 2,
    name: 'Client Name',
    description: 'The name of the Client',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  taskDescription: {
    internalId: 3,
    name: 'Delegation Description',
    description: 'Short description of the Delegation',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  destinationFolderUrl: {
    internalId: 4,
    name: 'URL or id of destination Google Drive folder',
    description: 'The URL or id of destination Google Drive folder where file should be copied to',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  newGoogleSheetUrl: {
    internalId: 5,
    name: 'New Google Sheet Document URL',
    type: VARIABLE_TYPES.URL,
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
