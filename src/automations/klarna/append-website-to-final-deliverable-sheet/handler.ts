import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'd44b1cb9-8186-41c1-946c-53a744d96d2e'
const name = 'Append website to final deliverable sheet'
const path = 'klarna/append-website-to-final-deliverable-sheet'
const description = 'Append scrapped website to final deliverable sheet'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  spreadsheetUrl: {
    internalId: 1,
    name: 'Spreadsheet URL',
    description: 'Spreadsheet URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  brand: {
    internalId: 2,
    name: 'Brand',
    description: 'Website brand',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  url: {
    internalId: 3,
    name: 'URL',
    description: 'Website URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  country: {
    internalId: 4,
    name: 'Country',
    description: 'Website country',
    type: VARIABLE_TYPES.ENUM,
    required: true,
  },
  productDisplayPage: {
    internalId: 5,
    name: 'Product display page providers',
    description: 'Product display page providers',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  checkout: {
    internalId: 6,
    name: 'Checkout providers',
    description: 'Checkout providers',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  type: {
    internalId: 7,
    name: 'Type',
    description: 'Type',
    type: VARIABLE_TYPES.ENUM,
    required: true,
  },
  notes: {
    internalId: 8,
    name: 'Notes',
    description: 'Notes',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  productDisplayPageFreeText: {
    internalId: 9,
    name: 'PDP Free Text',
    description: 'Product Display Page Free Text',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
  checkoutFreeText: {
    internalId: 10,
    name: 'Checkout Free Text',
    description: 'Checkout Free Text',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {} as const

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
