import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_SCHEMAS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'a8e8e26e-aca2-4bc6-a738-2189f33d02e8'
const name = 'Hunter Email Verifier'
const path = 'hunter-verifier'
const description = 'Gets emails, checks validity'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const EXAMPLE_INPUT = {
  email: 'francis@invisible.email',
}

const EXAMPLE_OUTPUT = {
  email: 'francis@invisible.email',
  status: 'valid',
  score: 100,
}

const inputs: TInputsOutputs = {
  table: {
    internalId: 1,
    name: 'Table with emails',
    description: '{ email: string }',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          email: VARIABLE_SCHEMAS[VARIABLE_TYPES.EMAIL],
        },
        examples: [EXAMPLE_INPUT],
      },
      examples: [[EXAMPLE_INPUT]],
    },
    required: true,
  },
} as const

// Source: https://hunter.io/api-documentation/v2#email-verifier
const outputs: TInputsOutputs = {
  emails: {
    internalId: 2,
    name: 'Array of email, score, status (validity)',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          status: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          email: VARIABLE_SCHEMAS[VARIABLE_TYPES.EMAIL],
          score: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
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
