import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'be668e86-0ebb-48c3-99ce-5316c97c6b41'
const name = 'Doordash Pickup Price Enterprise Import Sheet Automation'
const path = 'doordash/pup-enterprise/import-sheet'
const description = 'Import Sheet Data for Doordash Pickup Price Enterprise Process'
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
  maxImagesAllowed: {
    internalId: 3,
    name: 'Max Allowed Images to Upload',
    type: VARIABLE_TYPES.NUMBER,
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
