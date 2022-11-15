import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'ad33d26a-6fbd-4cf2-897a-ddb69acf196c'
const name = 'Doordash PS Export automation'
const path = 'doordash/ps/batch-export'
const description = 'Export to sheets'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  driveFolderKey: {
    internalId: 1,
    name: 'Drive Folder ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  keys: {
    internalId: 2,
    name: 'Keys',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  baseId: {
    internalId: 3,
    name: 'Cases Base Id',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 4,
    name: 'Export sheet link',
    type: VARIABLE_TYPES.STRING,
    required: false,
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
