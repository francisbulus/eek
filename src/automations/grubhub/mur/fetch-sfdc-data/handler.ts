import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = 'f90c45c0-0b20-45c7-96dd-0582c2e23ac6'
const name = 'GrubHub MUR Fetch SFDC Data Automation'
const path = 'grubhub/mur/fetch-sfdc-data'
const description = 'Fetch Salesforce Data for GrubHub MUR Process'
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
