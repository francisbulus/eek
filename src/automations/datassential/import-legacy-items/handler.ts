import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '2c07e709-c279-45b1-bdcd-fc38e59c1e2d'
const name = 'Datassential Import Legacy Automation'
const path = 'datassential/import-legacy-items'
const description = 'Datassential Restaurants Legacy Items Import Automation'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  restCode: {
    internalId: 1,
    name: 'Restaurant Code',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 2,
    name: 'Legacy Items',
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
