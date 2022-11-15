import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '7d1477a2-d842-4366-936d-49b18f838e3f'
const name = 'Send Slack Message (via API)'
const path = 'send-slack-message'
const description = 'Send a message to the given channel. Message can use mustache tags'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  channel: {
    internalId: 1,
    name: 'Channel',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  message: {
    internalId: 2,
    name: 'Message',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  formattedMessage: {
    internalId: 3,
    name: 'Formatted Message',
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
