import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../helpers/types'
import execute from './index'

const uid = 'dfb99cca-7821-407b-a95f-a4d98a113a23'
const name = 'Google Cloud Storage Object Delete'
const path = 'delete-gcloud-storage'
const description = 'Deletes Object from Google Cloud Storage'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  objectId: {
    internalId: 1,
    name: 'GCloud Storage Object IDs',
    type: VARIABLE_TYPES.ARR_STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  result: {
    internalId: 2,
    name: 'Result',
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
