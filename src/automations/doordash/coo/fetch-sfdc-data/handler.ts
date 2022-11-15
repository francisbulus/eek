import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '1b649268-ee35-4b4b-85ce-27d1a3329030'
const name = 'Doordash COO Fetch SFDC Data Automation'
const path = 'doordash/coo/fetch-sfdc-data'
const description = 'Fetch Salesforce Data for Doordash COO Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  opportunityId: {
    internalId: 1,
    name: 'Opportunity ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  opportunityName: {
    internalId: 2,
    name: 'Opportunity Name',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  opportunityURL: {
    internalId: 3,
    name: 'Opportunity URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  opportunityStage: {
    internalId: 4,
    name: 'Opportunity Stage',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  accountName: {
    internalId: 5,
    name: 'Account Name',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  accountURL: {
    internalId: 6,
    name: 'Account URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  msid: {
    internalId: 7,
    name: 'MSID',
    type: VARIABLE_TYPES.STRING,
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
