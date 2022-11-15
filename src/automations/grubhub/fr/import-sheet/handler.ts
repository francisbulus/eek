import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '41a38c5e-3c82-4c1d-967d-ecdb2c9ed179'
const name = 'GrubHub FR Import Sheet Automation'
const path = 'grubhub/fr/import-sheet'
const description = 'Import Sheet Data for GrubHub FR Process'
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
  baseId: {
    internalId: 2,
    name: 'FR Base ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 3,
    name: 'Result data set of the automation',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: false,
  },
  autoAssignData: {
    internalId: 4,
    name: 'Result data set of the automation for auto complete',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: false,
  },
  importErrors: {
    internalId: 5,
    name: 'Errors in import',
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
