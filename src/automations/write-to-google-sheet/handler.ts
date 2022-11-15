import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '1e27b58f-53c1-4339-8656-8ef1afb99bff'
const name = 'Write to Google Sheet'
const path = 'write-to-google-sheet'
const description = 'Write an array of objects as rows in a google sheet. Will overwrite existing'
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
  tabName: {
    internalId: 2,
    name: 'Tab Name',
    description: 'The name of the tab you want to write to',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  range: {
    internalId: 3,
    name: 'Range',
    description: 'The top left cell to write to, in A1 notation',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  values: {
    internalId: 4,
    name: 'Values',
    description: 'The values you want to write',
    type: VARIABLE_TYPES.ARR_ANY, // can be object[] or string[][]
    required: true,
  },
  includeHeaderRow: {
    internalId: 5,
    name: 'Write header row?',
    description: `Defaults to false. Note: if you have an array of arrays that DOESN'T include a header row, you should set this to true`,
    type: VARIABLE_TYPES.BOOLEAN,
    required: false,
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
