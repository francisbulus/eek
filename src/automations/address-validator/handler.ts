import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_SCHEMAS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'b99398b4-a49f-4bc5-b33a-88b533a4d057'
const name = 'Address Validator'
const path = 'address-validator'
const description = 'Validate addresses from a given table'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const EXAMPLE_INPUT = {
  'Unvalidated Address': '1320 Kershaw Loop - Unit 210, Fayatteville, NC 28314',
}

const EXAMPLE_OUTPUT = {
  'Unvalidated Address': '1320 Kershaw Loop - Unit 210, Fayatteville, NC 28314',
  Status: 'Valid',
  'Formatted Address': '1320 Kershaw Loop APT 210, Fayetteville, NC 28314, USA',
}

const inputs: TInputsOutputs = {
  arrayInput: {
    internalId: 1,
    name: 'Unvalidated Address Table',
    description: 'Table of Invalid Address Objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          'Unvalidated Address': VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
        },
        examples: [EXAMPLE_INPUT],
      },
      examples: [[EXAMPLE_INPUT]],
    },
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  arrayOutput: {
    internalId: 2,
    name: 'Address Validation Table',
    description: 'Table of Address Validation Objects',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          'Unvalidated Address': VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          Status: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          'Formatted Address': VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
        },
        examples: [EXAMPLE_OUTPUT],
      },
      examples: [[EXAMPLE_OUTPUT]],
    },
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
