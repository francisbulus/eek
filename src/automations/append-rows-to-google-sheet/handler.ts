import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'b1793fa0-5621-4908-8445-08832448baaa'
const name = 'Append Rows to Google Sheet'
const path = 'append-rows-to-google-sheet'
const description =
  'Append an array of objects as rows in a google sheet, starting at the first blank row. Will add new rows'
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
    description: 'The values you want to write as an array of objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
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
