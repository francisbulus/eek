import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'ce696729-55a6-4114-ade1-77be1fdd8cc6'
const name = 'Datassential Import Sheet Automation'
const path = 'datassential/import-sheet'
const description = 'Datassential Restaurants Menu Sheet Import Automation'
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
  restType: {
    internalId: 3,
    name: 'Restaurant Type',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 4,
    name: 'Data rows contained in sheet',
    type: VARIABLE_TYPES.ARR_OBJECT,
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
