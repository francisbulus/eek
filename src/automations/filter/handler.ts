import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '0bd1480f-07fd-4737-875a-6f287365aa84'
const name = 'Filter Array of Objects'
const path = 'filter'
const description = 'Creates a new array of objects that match the given criteria'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Array Input',
    description: 'Array of objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  filters: {
    internalId: 2,
    name: 'Filters',
    description: 'Object of field to value pairs',
    type: VARIABLE_TYPES.OBJECT,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 3,
    name: 'Filtered Array',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
} as const

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
