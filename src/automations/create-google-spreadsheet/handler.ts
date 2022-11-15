import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'c7c9bbc3-2254-41d9-a912-907c07bf0f25'
const name = 'Create Google Spreadsheet'
const path = 'create-google-spreadsheet'
const description = 'Given a title, create a Google Spreadsheet Document'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  title: {
    internalId: 1,
    name: 'Document Title',
    description: 'The title of the Google Spreadsheet',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  folderId: {
    internalId: 2,
    name: 'Folder Id',
    description: 'The parent folder ID of the newly created document',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  newGoogleSheetUrl: {
    internalId: 3,
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
