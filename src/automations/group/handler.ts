import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'b4d1c8a1-1339-4d5c-b3fb-e8c5a1cfd738'
const name = 'Group Items in an Array By Fields'
const path = 'group'
const description = 'Split an array of objects into groups, where key is the value'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Array Input',
    description: 'Array of elements',
    type: VARIABLE_TYPES.ARR_ANY,
    required: true,
  },
  field: {
    internalId: 2,
    name: 'field',
    description: 'Field to group by',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  objectOutput: {
    internalId: 3,
    name: 'Grouped Object',
    description: 'See https://lodash.com/docs/4.17.15#groupBy',
    type: VARIABLE_TYPES.OBJECT,
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
