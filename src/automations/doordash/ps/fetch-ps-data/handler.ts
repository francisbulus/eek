import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '0e37c52d-e3d0-4026-851a-a576e46f6936'
const name = 'Doordash PS Import Sheet Automation'
const path = 'doordash/ps/fetch-ps-data'
const description = 'Import Sheet Data for Doordash PS Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  batchDate: {
    internalId: 1,
    name: 'Batch Date',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  sheetUrl: {
    internalId: 2,
    name: 'Sheet Url',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  sheetTab: {
    internalId: 3,
    name: 'Sheet Tab',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  driveFolderKey: {
    internalId: 4,
    name: 'Drive Folder Key',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 5,
    name: 'Result Payload',
    type: VARIABLE_TYPES.ARR_OBJECT,
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
