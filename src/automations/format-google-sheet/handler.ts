import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'ea12fd1a-64ac-471f-be7c-f98960bf1e27'
const name = 'Format Google Sheet'
const path = 'format-google-sheet'
const description = 'Apply the formatting protocol to the given tab, and rename and color all tabs'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'Google Sheet URL',
    description: 'The URL or id of the Google Sheet Document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  tabName: {
    internalId: 2,
    name: 'Tab Name',
    description: 'The name of the tab to format',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = null

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
