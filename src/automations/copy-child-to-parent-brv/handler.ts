import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'a8f374b5-34b9-4961-8367-17a2204d1e65'
const name = 'Copy child base run variable values to parent base run variable automation'
const path = 'copy-child-to-parent-brv'
const description = 'Copy child base run variables to parent'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  variables: {
    internalId: 1,
    name: 'The list of the variables to copy',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
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
