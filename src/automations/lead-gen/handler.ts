import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_SCHEMAS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'bbd7ecf8-4637-42c7-8a6f-d5607d131795'
const name = 'Lead Gen'
const path = 'lead-gen'
const description = 'To find leads based on roles and company names'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = false

const EXAMPLE_INPUT = {
  company_name: 'Invisible',
  roles: 'marketing',
  domain_name: 'invisible.email',
  location: 'New York',
}

const EXAMPLE_OUTPUT = {
  name: 'Francis',
  title: 'CEO',
  company: 'Invisible Technologies',
  email: 'francis@invisible.email',
}

const inputs: TInputsOutputs = {
  table: {
    internalId: 1,
    name: 'Table with Company Names and Roles',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          company_name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          roles: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          domain_name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          location: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
        },
        examples: [EXAMPLE_INPUT],
      },
      examples: [[EXAMPLE_INPUT]],
    },
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  table: {
    internalId: 2,
    name: 'Array of name, role, company and email',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          title: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          company: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          email: VARIABLE_SCHEMAS[VARIABLE_TYPES.EMAIL],
        },
        examples: [EXAMPLE_OUTPUT],
      },
      examples: [[EXAMPLE_OUTPUT]],
    },
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
