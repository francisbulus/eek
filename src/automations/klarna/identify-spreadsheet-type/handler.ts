import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '37e474b0-c68d-4f0b-a7e7-e5b84b278af9'
const name = 'Identify Spreadsheet Type'
const path = 'klarna/identify-spreadsheet-type'
const description = 'Identify spreadsheet type'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  country: {
    internalId: 1,
    name: 'Country',
    description: 'Target Country',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  simpleSpreadsheetUrl: {
    internalId: 2,
    name: 'Simple Template Spreadsheet',
    description: 'Simple Template Spreadsheet Google Sheets URL',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
  completeSpreadsheetUrl: {
    internalId: 3,
    name: 'Complete Template Spreadsheet',
    description: 'Simple Template Spreadsheet Google Sheets URL',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  spreadsheetTemplateUrl: {
    internalId: 4,
    name: 'Template Spreadsheet',
    description: 'Selected Template Spreadsheet URL',
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
