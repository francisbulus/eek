import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '296ccce3-7dea-4f37-89e3-704408539e8b'
const name = 'JIRA Write'
const path = 'jira-write'
const description = 'Update data on Jira'
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
  jiraId: {
    internalId: 2,
    name: 'JIRA ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  data: {
    internalId: 3,
    name: 'Data',
    type: VARIABLE_TYPES.OBJECT,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  data: {
    internalId: 4,
    name: 'Data',
    type: VARIABLE_TYPES.OBJECT,
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
