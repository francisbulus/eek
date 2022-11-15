import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '9a7f7c06-5877-4734-a4fa-dd5592a03497'
const name = 'Chunk Array into Smaller Arrays'
const path = 'chunk'
const description = 'Output is an array of arrays'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Array Input',
    description: 'Array',
    type: VARIABLE_TYPES.ARR_ANY,
    required: true,
  },
  chunkSize: {
    internalId: 2,
    name: 'Chunk Size',
    description: 'Number of elements in one chunk',
    type: VARIABLE_TYPES.NUMBER,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 3,
    name: 'Chunked Array of Arrays',
    type: VARIABLE_TYPES.ARR_ARR_ANY,
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
