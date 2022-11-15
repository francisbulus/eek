import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '12befbc0-2c5d-4e24-83af-67e63443472f'
const name = 'Export'
const path = 'bolt-document-verification/export'
const description = 'Export'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  spreadsheetUrl: {
    internalId: 1,
    name: 'Spreadsheet Url',
    description: 'Spreadsheet Url',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  type: {
    internalId: 2,
    name: 'Type',
    description: 'Type',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  ref: {
    internalId: 3,
    name: 'Ref',
    description: 'Ref',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  status: {
    internalId: 4,
    name: 'Status',
    description: 'Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  failureReason: {
    internalId: 5,
    name: 'Failure Reason',
    description: 'Failure Reason',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  screenshotUrl: {
    internalId: 6,
    name: 'Screenshot Url',
    description: 'Screenshot Url',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {} as const

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
