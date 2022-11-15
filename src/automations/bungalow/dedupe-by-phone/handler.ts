import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'ab6bc42f-006b-4aab-be45-460f501717ba'
const name = 'De-duplicate Leads by Phone Number'
const path = 'bungalow/dedupe-by-phone'
const description = 'Given a batch ID, deduplicate all Leads by Phone Number'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {} as const

const outputs: TInputsOutputs = {} as const

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
