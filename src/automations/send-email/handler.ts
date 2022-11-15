import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'dfa2932a-8cd5-4193-997d-1eaabdc0bc8f'
const name = 'Send Email'
const path = 'send-email'
const description = 'Sends Email'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  destination: {
    internalId: 1,
    name: 'Destination Email',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  subject: {
    internalId: 2,
    name: 'Subject',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  body: {
    internalId: 3,
    name: 'Body',
    type: VARIABLE_TYPES.HTML,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  result: {
    internalId: 4,
    name: 'Result',
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
