import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '115404a0-be5b-4bee-9eb9-fde2ca021125'
const name = 'Bolt RMP Competitor Scraping Automation'
const path = 'bolt/rmp/scraping-automation'
const description = 'An automation that scrapes different restaurant competitors for Bolt'
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
