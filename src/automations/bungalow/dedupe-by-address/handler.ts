import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'c3a70516-cbbb-4cc2-8c18-a88c25e786e5'
const name = 'De-duplicate Leads by Address'
const path = 'bungalow/dedupe-by-address'
const description = 'Given a batch ID, deduplicate all Leads by Address'
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
