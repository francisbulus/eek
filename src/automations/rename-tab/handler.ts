import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = '54b7ea56-4c2c-4147-b164-55ab90547b34'
const name = 'Rename tab in Google Sheet Document'
const path = 'rename-tab'
const description = 'Given a Google Sheet URL and a new tab title, rename a tab'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  googleSheetUrl: {
    internalId: 1,
    name: 'Google Sheet URL',
    description: 'The URL or id of the entire spreadsheet document',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  currentTabTitle: {
    internalId: 2,
    name: 'Current Tab Title',
    description: 'The the tab you want to rename',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  newTabTitle: {
    internalId: 3,
    name: 'New Tab Title',
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
