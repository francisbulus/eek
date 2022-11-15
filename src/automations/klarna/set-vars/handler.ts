import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'af738d26-bc17-4246-abe7-a9796a767edf'
const name = 'Set Vars'
const path = 'klarna/set-vars'
const description = 'Set Vars'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {} as const

const outputs: TInputsOutputs = {
  simpleSpreadsheetUrl: {
    internalId: 1,
    name: 'Simple Template Spreadsheet',
    description: 'Simple Template Spreadsheet Google Sheets URL',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
  completeSpreadsheetUrl: {
    internalId: 2,
    name: 'Complete Template Spreadsheet',
    description: 'Simple Template Spreadsheet Google Sheets URL',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
  type: {
    internalId: 3,
    name: 'Type',
    description: 'Simple or complete',
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
