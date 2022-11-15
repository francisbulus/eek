import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'ab6bc42f-006b-4aab-be45-460f501717ba'
const name = 'Duplicate Google Sheet Document'
const path = 'duplicate-google-sheet'
const description = 'Given a Google Sheet URL, create a duplicate'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'URL or id of Google Sheet Document to duplicate',
    description: 'The URL or id of the spreadsheet document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  newGoogleSheetUrl: {
    internalId: 2,
    name: 'New Google Sheet Document URL',
    type: VARIABLE_TYPES.URL,
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
