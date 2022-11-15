import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '1b207014-a5b4-4d53-ae22-c46940f82a3f'
const name = 'Reset Zoom Meeting Password'
const path = 'reset-zoom-meeting-password'
const description = 'Generate a new password of a given zoom room'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = true
const synchronous = true

const inputs: TInputsOutputs = {
  meeting_id: {
    internalId: 1,
    name: 'Meeting ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  password: {
    internalId: 2,
    name: 'Password',
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
