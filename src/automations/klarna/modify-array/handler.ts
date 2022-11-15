import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '0882b5ee-4e89-4753-aeb2-6e29d844891f'
const name = 'ModifyArray'
const path = 'klarna/modify-array'
const description = 'Modify input data'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  input_data: {
    internalId: 1,
    name: 'Input Data',
    description: 'Array to be modified',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  market: {
    internalId: 2,
    name: 'market',
    description: 'Market',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  pick_list: {
    internalId: 3,
    name: 'Picklist',
    description: 'Picklist',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  final_deliverable_sheet: {
    internalId: 4,
    name: 'FinalDeliverableSheet',
    description: 'Final Deliverable Sheet',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  output: {
    internalId: 5,
    name: 'Output',
    description: 'Output Array',
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
