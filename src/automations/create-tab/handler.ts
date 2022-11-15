import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'cdebf373-7eb0-4c9c-a24d-39f3f08a78ac'
const name = 'Create new tab in Google Sheet Document'
const path = 'create-tab'
const description = 'Given a Google Sheet URL and a tab title, create a new tab'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'Google Sheet URL',
    description: 'The URL or id of the Google Sheet document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  title: {
    internalId: 2,
    name: 'Tab Title',
    description: 'The title of the Tab you want to create',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  tabId: {
    internalId: 3,
    name: 'Created tab id',
    type: VARIABLE_TYPES.NUMBER,
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
