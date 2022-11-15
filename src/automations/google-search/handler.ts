import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_SCHEMAS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '2c1f6797-2fc8-49c3-9d0a-dc9d5b3fcbbb'
const name = 'Google Search by Keywords List'
const path = 'google-search'
const description = 'A step that searches Google by keywords and return its results'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  keywords: {
    internalId: 1,
    name: 'Keywords List',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  limitOfResultsPerKeyword: {
    internalId: 2,
    name: 'Number of Results per Keyword',
    type: VARIABLE_TYPES.NUMBER,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  searchOutputs: {
    internalId: 3,
    name: 'Search Results',
    type: VARIABLE_TYPES.ARR_OBJECT,
    schema: {
      ...VARIABLE_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
      items: {
        ...VARIABLE_SCHEMAS[VARIABLE_TYPES.OBJECT],
        properties: {
          keyword: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          link: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          title: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          snippet: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          displayLink: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          formattedUrl: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
          htmlTitle: VARIABLE_SCHEMAS[VARIABLE_TYPES.STRING],
        },
      },
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
