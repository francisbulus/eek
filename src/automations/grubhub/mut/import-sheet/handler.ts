import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '8e5f4e80-e639-415a-bf0f-bc3ee161622d'
const name = 'GrubHub MUT Import Sheet Automation'
const path = 'grubhub/mut/import-sheet'
const description = 'Import Sheet Data for GrubHub MUT Process'
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
  processType: {
    internalId: 3,
    name: 'MUT Process Type',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  data: {
    internalId: 4,
    name: 'Data rows contained in sheet',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: false,
  },
  importErrors: {
    internalId: 5,
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
