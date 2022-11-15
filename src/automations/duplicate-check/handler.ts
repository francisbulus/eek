import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '3749fae1-9cce-4846-8259-6f02a6b892a4'
const name = 'Duplicate Check'
const path = 'duplicate-check'
const description = 'Check for duplicate records against the process engine records'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  records: {
    internalId: 1,
    name: 'Records',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  duplicate_check_config: {
    internalId: 2,
    name: 'Duplicate Check Config',
    type: VARIABLE_TYPES.OBJECT,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  duplicateRecords: {
    internalId: 5,
    name: 'Duplicate records array of Objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  duplicateRecordsCount: {
    internalId: 5,
    name: 'Duplicate records count',
    type: VARIABLE_TYPES.NUMBER,
    required: true,
  },
  nonDuplicateRecords: {
    internalId: 5,
    name: 'Non Duplicate records array of Objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  nonDuplicateRecordsCount: {
    internalId: 5,
    name: 'Non Duplicate records count',
    type: VARIABLE_TYPES.NUMBER,
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
