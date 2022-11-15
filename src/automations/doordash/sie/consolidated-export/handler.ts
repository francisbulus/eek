import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '61202a7f-83f6-416d-8508-570e9d99b2d8'
const name = 'Doordash SIE Consolidated Automation'
const path = 'doordash/sie/consolidated-export'
const description = 'Export Sheet Data for Doordash SIE Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  sheetUrls: {
    internalId: 1,
    name: 'Sheet URLs',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 3,
    name: 'Export URL',
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
