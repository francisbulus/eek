import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'bddf93bd-573f-4482-8f61-6a229732f747'
const name = 'Google Doc Create'
const path = 'create-google-doc'
const description = 'Creates Google Docs'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  content: {
    internalId: 1,
    name: 'Content',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  title: {
    internalId: 1,
    name: 'Title',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  driveFolderKey: {
    internalId: 3,
    name: 'GDrive Folder URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  uploadedFileUrl: {
    internalId: 4,
    name: 'Uploaded GDoc Files URL',
    type: VARIABLE_TYPES.STRING,
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
