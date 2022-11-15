import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '90b45744-ed36-4ac7-94d9-51d9469fb6fd'
const name = 'ModifyArray'
const path = 'bolt-document-verification/modify-array'
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
  spreadsheet_url: {
    internalId: 2,
    name: 'Spreadsheet URL',
    description: 'Spreadsheet URL',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  output: {
    internalId: 3,
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
