import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '92373580-2178-4e63-aef0-29bb5d1f4e42'
const name = 'Copy parent base run variable values to child base run variable automation'
const path = 'copy-parent-to-child-brv'
const description = 'Copy parent base run variables values to child'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  variables: {
    internalId: 1,
    name: 'The list of the variable to copy',
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
