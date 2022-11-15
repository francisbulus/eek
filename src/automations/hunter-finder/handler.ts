import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_SCHEMAS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '7d4b2228-48ec-4280-8bf4-e3ff4e4f0e4e'
const name = 'Hunter Email Finder'
const path = 'hunter-finder'
const description =
  'Gets emails with first name, last name, and company and/or domain inputs using Hunter.io'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const EXAMPLE_INPUT = {
  firstName: 'Alicia',
  lastName: 'Davis',
  company: 'Amazon',
  domain: 'amazon.com',
}

const EXAMPLE_OUTPUT = {
  email: 'dustin@asana.com',
  first_name: 'Dustin',
  last_name: 'Moskovitz',
  position: 'CEO',
  domain: 'asana.com',
  twitter: 'moskov',
  linkedin: 'https://www.linkedin.com/in/dmoskov',
  phone_number: '4157311234',
  company: 'Asana',
}

const inputs: TInputsOutputs = {
  table: {
    internalId: 1,
    name: 'Table with details',
    description:
      'firstName, lastName, company, domain. Minimum is firstName, lastName and company OR domain',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          firstName: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          lastName: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          company: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          domain: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
        },
        examples: [EXAMPLE_INPUT],
      },
      examples: [[EXAMPLE_INPUT]],
    },
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  emails: {
    internalId: 2,
    name: 'Emails for the given domains',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          email: VARIABLE_SCHEMAS[VARIABLE_TYPES.EMAIL],
          first_name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          last_name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          position: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          domain: VARIABLE_SCHEMAS[VARIABLE_TYPES.URL],
          twitter: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          linkedin: VARIABLE_SCHEMAS[VARIABLE_TYPES.URL],
          phone_number: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          company: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
        },
        examples: [EXAMPLE_OUTPUT],
      },
      examples: [[EXAMPLE_OUTPUT]],
    },
    required: false, // might not be any matches
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
