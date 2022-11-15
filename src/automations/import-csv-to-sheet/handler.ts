import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '2fea337a-4a16-4843-9e2d-121064b67b7b'
const name = 'Import CSV into Google Sheet Document'
const path = 'import-csv-to-sheet'
const description = 'The CSV should be uploaded in a previous step to our Google Cloud Storage'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'Google Sheet URL',
    description: 'The URL or id of the entire spreadsheet document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  csvFileUrl: {
    internalId: 2,
    name: 'URL of the CSV file',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
  tabName: {
    internalId: 3,
    name: 'Tab Name',
    description: 'The name of the tab you want to import the csv into',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = null

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
