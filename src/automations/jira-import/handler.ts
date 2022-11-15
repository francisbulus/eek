import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '296ccce3-7dea-4f37-89e3-704408539e8b'
const name = 'JIRA Import'
const path = 'jira-import'
const description = 'Import data from Jira'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  jiraUrl: {
    internalId: 1,
    name: 'JIRA URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  projects: {
    internalId: 3,
    name: 'JIRA Projects',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  fields: {
    internalId: 3,
    name: 'Fields',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  filters: {
    internalId: 3,
    name: 'Filters',
    type: VARIABLE_TYPES.OBJECT,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  jiraTickets: {
    internalId: 2,
    name: 'JIRA Tickets',
    type: VARIABLE_TYPES.ARR_OBJECT,
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
