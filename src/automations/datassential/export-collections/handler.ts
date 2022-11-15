import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'f2008a92-27ba-4964-80d6-adfcbde0d392'
const name = 'Datassential Export Collection'
const path = 'datassential/export-collections'
const description = 'Datassential Restaurants Collections export automation'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  driveFolderKey: {
    internalId: 1,
    name: 'Drive Folder ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  sourceUrl: {
    internalId: 1,
    name: 'Source URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  name: {
    internalId: 1,
    name: 'Restaurant Name',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  restCode: {
    internalId: 1,
    name: 'Restaurant Code',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  address: {
    internalId: 1,
    name: 'Address',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  menuScreenshotUrls: {
    internalId: 1,
    name: 'Menu Screenshot Url',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  exportLink: {
    internalId: 2,
    name: 'Collection Sheet URL',
    type: VARIABLE_TYPES.STRING,
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
