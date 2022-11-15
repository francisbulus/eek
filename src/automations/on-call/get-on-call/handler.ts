import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'a4ed1c5b-69ff-4c6d-9656-5f2591ecdba0'
const name = 'Get On Call'
const path = 'on-call/get-on-call'
const description = 'Find On-Call person from OpsGenie'
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
