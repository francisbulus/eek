import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '9e15a7c8-fda7-48b4-bd41-78aca513c029'
const name = 'Create Final Deliverable Sheet'
const path = 'klarna/create-final-deliverable-sheet'
const description = 'Create a Google Spreadsheet Document in the final deliverable form'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  country: {
    internalId: 1,
    name: 'Market',
    description: 'Market',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  refDate: {
    internalId: 2,
    name: 'Reference Date (month)',
    description: 'Month to use as reference date',
    type: VARIABLE_TYPES.DATETIME,
    required: true,
  },
  templateUrl: {
    internalId: 3,
    name: 'Template Spreadsheet URL',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
  pickList: {
    internalId: 4,
    name: 'Pick list',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  spreadsheetUrl: {
    internalId: 4,
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
