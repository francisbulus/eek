import { STEP_TEMPLATE_AUTOMATION_LEVELS } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '02900682-ab0e-42e6-8356-94ee79398cf3'
const name = 'Doordash COO Save Step Outcome Automation'
const path = 'doordash/coo/save-step-outcome'
const description = 'Save Outcome for COO MTC Steps'
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
