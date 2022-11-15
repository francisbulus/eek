import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'ed47a7ef-3b0c-49f3-ae36-dfc5660ec86a'
const name = 'Start Contact Scraping Job'
const path = 'scrape-linkedin-contacts'
const description = 'A step that starts scraping a list of linkedin profile URLs'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = false

const inputs: TInputsOutputs = {
  urls: {
    internalId: 1,
    name: 'Profile URLs to scrape',
    type: VARIABLE_TYPES.ARR_URL,
    required: true,
  },
  credentialsId: {
    internalId: 2,
    name: 'Credentials id',
    type: VARIABLE_TYPES.NUMBER,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  contacts: {
    internalId: 3,
    name: 'Contacts',
    type: VARIABLE_TYPES.ARR_OBJECT, // can get the schema later
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
