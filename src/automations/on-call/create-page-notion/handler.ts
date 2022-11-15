import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '2f925c53-d231-4034-956a-2d823edbc7c6'
const name = 'Create Notion Page'
const path = 'on-call/create-notion-page'
const description = 'Update a notion page via the notion api'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = true
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
