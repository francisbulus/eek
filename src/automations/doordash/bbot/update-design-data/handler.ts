import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '0e46614d-0635-40cf-8300-30b2184c69e0'
const name = 'Update Airtable BBOT Signage Design Data'
const path = 'doordash/bbot/update-design-data'
const description = 'Updating Airtable Signage Design Data'
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
  designLink: {
    internalId: 2,
    name: 'Design Link',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  designPreviewImage: {
    internalId: 3,
    name: 'Design Preview Image',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  notesFromVendor: {
    internalId: 4,
    name: 'Notes from Vendor',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  recordID: {
    internalId: 5,
    name: 'Record ID',
    type: VARIABLE_TYPES.STRING,
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
