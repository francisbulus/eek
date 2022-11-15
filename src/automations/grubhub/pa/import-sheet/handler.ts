import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '0bd53bd8-29d3-4eed-bb4c-4bd82538264a'
const name = 'GrubHub PA Import Sheet Automation'
const path = 'grubhub/pa/import-sheet'
const description = 'Import Sheet Data for GrubHub PA Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  sheetUrl: {
    internalId: 1,
    name: 'Google Sheet Url',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  sheetTab: {
    internalId: 2,
    name: 'Google Sheet Tab',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 3,
    name: 'Data rows contained in sheet',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: false,
  },
  importErrors: {
    internalId: 4,
    name: 'Any error that happened during the Automation',
    type: VARIABLE_TYPES.STRING,
    required: false,
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
