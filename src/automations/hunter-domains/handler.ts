import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_SCHEMAS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'befc4626-1ecc-11eb-adc1-0242ac120002'
const name = 'Hunter Domain Search'
const path = 'hunter-domains'
const description = 'Gets emails with a domain name input using Hunter.io'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const EXAMPLE_INPUT = {
  domain: 'amazon.com',
  department: 'it',
}

const EXAMPLE_OUTPUT = {
  value: 'ciaran@intercom.io',
  type: 'personal',
  confidence: 92,
  first_name: 'Ciaran',
  last_name: 'Lee',
  position: 'Support Engineer',
  seniority: 'senior',
  department: 'it',
  linkedin: null,
  twitter: 'ciaran_lee',
  phone_number: '4153501234',
  domain: 'intercom.io',
}

const inputs: TInputsOutputs = {
  table: {
    internalId: 1,
    name: 'Table with domains (department optional)',
    description: '{ domain: string, department?: string }',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          domain: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          department: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
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
          value: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          type: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          confidence: VARIABLE_SCHEMAS[VARIABLE_TYPES.NUMBER],
          first_name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          last_name: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          position: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          seniority: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          department: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          linkedin: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          twitter: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          phone_number: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          domain: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
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
