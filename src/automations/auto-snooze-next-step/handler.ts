import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '65d0d1f6-059f-4f2f-9d22-65747074805a'
const name = 'Snooze next step run'
const path = 'auto-snooze-next-step'
const description = 'Snooze next step run'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  snoozeHours: {
    internalId: 1,
    name: 'Number of hours to snooze for',
    type: VARIABLE_TYPES.NUMBER,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {}

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
