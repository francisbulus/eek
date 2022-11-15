import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '4bb9ad3d-a5b0-4dfc-9b66-0d28ccc6b37b'
const name = 'Update Airtable BBOT Signage Design Status'
const path = 'doordash/bbot/update-design-status'
const description = 'Updating Airtable Signage Design Status'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  designStatus: {
    internalId: 1,
    name: 'Design Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  recordID: {
    internalId: 2,
    name: 'Record ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  designPreviewImage: {
    internalId: 3,
    name: 'Design Preview Image',
    type: VARIABLE_TYPES.STRING,
    required: false,
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
