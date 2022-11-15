import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '8a008a6f-f1d5-40dd-8ffd-246a9674c01f'
const name = 'Identify misalignments'
const path = 'klarna/identify-misalignments'
const description = 'Identify misalignments among agents'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  productDisplayPage1: {
    internalId: 1,
    name: 'Product display page providers 1',
    description: 'Product display page providers - Agent 1',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  checkout1: {
    internalId: 2,
    name: 'Checkout providers 1',
    description: 'Checkout providers - Agent 1',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  productDisplayPage2: {
    internalId: 3,
    name: 'Product display page providers 2',
    description: 'Product display page providers - Agent 2',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  checkout2: {
    internalId: 4,
    name: 'Checkout providers 2',
    description: 'Checkout providers - Agent 2',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  productDisplayPageMatches: {
    internalId: 5,
    name: 'Product display page providers matches',
    description: 'Product display page providers - Matches',
    type: VARIABLE_TYPES.ARR_BOOLEAN,
    required: true,
  },
  checkoutMatches: {
    internalId: 6,
    name: 'Checkout providers matches',
    description: 'Checkout providers - Matches',
    type: VARIABLE_TYPES.ARR_BOOLEAN,
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
