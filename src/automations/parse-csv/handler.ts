import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '9cea81d1-baed-4ccc-b4c1-5bd4aa01bc03'
const name = 'Parse CSV to Array of Objects'
const path = 'parse-csv'
const description = 'Given the URL for a CSV file, parse it into an array of objects'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  csvFileUrl: {
    internalId: 1,
    name: 'URL of the CSV file',
    type: VARIABLE_TYPES.URL,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  outputArrayOfObjects: {
    internalId: 2,
    name: 'Output Array of Objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
}

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
