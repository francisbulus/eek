import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'd1a464c3-2304-4dc3-9038-10dbbdc739d6'
const name = 'Map fields'
const path = 'map-fields'
const description =
  'Reassigns the values of one array of objects to a new array of arrays with the values in the correct positions'
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
  destinationHeaderRow: {
    internalId: 2,
    name: 'Destination Header Row',
    description: 'The headers of the destination (order matters)',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  fieldMapping: {
    internalId: 3,
    name: 'Field Mapping',
    description:
      'Key is field in current data, value is field in new data. Can also use template strings like {{ currDateSheet }}',
    type: VARIABLE_TYPES.OBJECT,
    required: true,
  },
  includeDestinationHeader: {
    internalId: 4,
    name: 'Include Destination Header',
    description: 'If true, will write the header row in the destination. Set to false if appending',
    type: VARIABLE_TYPES.BOOLEAN,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 5,
    name: 'Array Output',
    description: 'Note that the input is an array of objects, but the output is an array of arrays',
    type: VARIABLE_TYPES.ARR_ARR_STRING,
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
