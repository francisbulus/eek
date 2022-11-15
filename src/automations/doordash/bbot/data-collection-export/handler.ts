import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'a475051b-9880-4305-b602-48ce7b300e76'
const name = 'Drive/ Storefront/ BBot Data Collection Process'
const path = 'doordash/bbot/data-collection-export'
const description = 'Drive/ Storefront/ BBot Data Collection Process Export'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 1,
    name: 'Export Link',
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
