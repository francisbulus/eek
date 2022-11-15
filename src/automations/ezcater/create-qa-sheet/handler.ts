import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '0e01730d-080c-4772-a54e-404412ea990d'
const name = 'EZ Cater Menu Creation QA Sheet Generation'
const path = 'ezcater/create-qa-sheet'
const description = 'Create a QA Sheet from existing template'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  restaurantName: {
    internalId: 1,
    name: 'Restaurant Name',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  qaSheetURL: {
    internalId: 2,
    name: 'QA Sheet URL',
    type: VARIABLE_TYPES.STRING,
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
