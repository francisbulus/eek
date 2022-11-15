import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '4456e5bf-86d9-4f71-9b7a-8459433c377f'
const name = 'Send Slack Message (Webhook)'
const path = 'send-slack-message-via-webhook'
const description = 'A step that sends a slack message on a specific channel'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  username: {
    internalId: 1,
    name: 'Displayed User Name',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  messageContent: {
    internalId: 2,
    name: 'Message Content Text',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  webhookUrl: {
    internalId: 3,
    name: 'Webhook URL',
    description: 'See: https://api.slack.com/messaging/webhooks#create_a_webhook',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
} as const

const outputs: TInputsOutputs = null

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
