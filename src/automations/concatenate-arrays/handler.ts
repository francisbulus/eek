import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'c9193ad8-00f0-47f9-abbf-d4c350ec10e1'
const name = 'Concatenate Two Arrays of Objects'
const path = 'concatenate-arrays'
const description =
  'Creates a new array that combines the two input arrays. Assumes both arrays are of the same type'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  inputArray1: {
    internalId: 1,
    name: 'Input Array 1',
    description: 'First array of objects',
    type: VARIABLE_TYPES.ARR_ANY, // keeping this generic for now
    required: true,
  },
  inputArray2: {
    internalId: 2,
    name: 'Input Array 2',
    description: 'Second array of objects',
    type: VARIABLE_TYPES.ARR_ANY, // keeping this generic for now
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  outputArray: {
    internalId: 3,
    name: 'Combined Array',
    type: VARIABLE_TYPES.ARR_ANY, // keeping this generic for now
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
