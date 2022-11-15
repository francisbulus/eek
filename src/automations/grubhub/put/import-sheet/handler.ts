import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'ecb679ad-9ed3-48fc-91d9-b6d5feaecea3'
const name = 'GrubHub PUT Import Sheet Automation'
const path = 'grubhub/put/import-sheet'
const description = 'Import Sheet Data for GrubHub PUT Process'
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
    name: 'PUT Process Type',
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
