import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'd0895e7a-61c2-4ca9-9e92-d3e6b635a008'
const name = 'Read Google Sheet'
const path = 'read-google-sheet'
const description = 'Given a Google Sheet URL, output an array of objects'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'Google Sheet URL',
    description: 'The URL or id of the Google Sheets Document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  tabName: {
    internalId: 2,
    name: 'Tab Name',
    description: 'The name of the one tab you want to read from',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  range: {
    internalId: 3,
    name: 'Range',
    description: 'The range to read, in A1 notation',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  columns: {
    internalId: 4,
    name: 'Columns',
    description: 'Columns to read',
    type: VARIABLE_TYPES.ARR_STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  outputArrayOfObjects: {
    internalId: 5,
    name: 'Output Array of Objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
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
