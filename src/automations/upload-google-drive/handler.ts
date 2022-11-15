import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'c03b98e0-b4dd-11ec-b909-0242ac120002'
const name = 'Google Drive Upload'
const path = 'upload-google-drive'
const description = 'Uploads Google Drive'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  files: {
    internalId: 1,
    name: 'Files',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
  driveFolderKey: {
    internalId: 2,
    name: 'GDrive Folder URL',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  fetchHeaders: {
    internalId: 3,
    name: 'Headers required to fetch the file',
    type: VARIABLE_TYPES.OBJECT,
    required: false,
  },
} as const

const outputs: TInputsOutputs = {
  uploadedFileUrl: {
    internalId: 4,
    name: 'Uploaded GDrive Files URLs',
    type: VARIABLE_TYPES.ARR_STRING,
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
