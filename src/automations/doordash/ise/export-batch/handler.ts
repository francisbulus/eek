import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '780d59cd-b097-4bff-8395-55d4e072b1e3'
const name = 'Inside Sales Lead Enrichment'
const path = 'doordash/ise/export-batch'
const description = 'Doordash Inside Sales Lead Enrichment export automation'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {} as const

const outputs: TInputsOutputs = {
  exportLink: {
    internalId: 1,
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
