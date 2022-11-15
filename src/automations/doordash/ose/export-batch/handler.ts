import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '0c796ee4-19f1-459b-8c07-79907fd5aa20'
const name = 'Outside Sales Lead Enrichment'
const path = 'doordash/ose/export-batch'
const description = 'Doordash Outside Sales Lead Enrichment export automation'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  batchID: {
    internalId: 1,
    name: 'Batch Base Run ID',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  exportLink: {
    internalId: 2,
    name: 'Export Link',
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
