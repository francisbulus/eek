import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '707d0a7a-bb3a-4a1f-8c1a-aa3c0a19b9b1'
const name = 'Nop'
const path = 'nop'
const description = 'No operation'
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
  synchronous,
  automationLevel,
  allowRetry,
  execute,
}

export default handler
