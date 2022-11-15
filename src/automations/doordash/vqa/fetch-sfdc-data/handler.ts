import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '2e73176e-8d1a-493f-85be-abc6c98912c9'
const name = 'Doordash VQA Fetch SFDC Data Automation'
const path = 'doordash/vqa/fetch-sfdc-data'
const description = 'Fetch Salesforce Data for Doordash VQA Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 1,
    name: 'Fetched Array of Cases',
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
