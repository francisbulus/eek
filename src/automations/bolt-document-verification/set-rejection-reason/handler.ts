import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = '9d29b9f1-8bf0-4567-986b-cf71644f687e'
const name = 'Set rejection reason'
const path = 'bolt-document-verification/set-rejection-reason'
const description = 'Set rejection reason'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  criminalRecordStatus: {
    internalId: 1,
    name: 'Criminal Record Status',
    description: 'Criminal Record Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  ibanStatus: {
    internalId: 2,
    name: 'Iban Status',
    description: 'Iban Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  selfEmploymentStatus: {
    internalId: 3,
    name: 'Self Employment Status',
    description: 'Self Employment Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  checkIdStatus: {
    internalId: 4,
    name: 'Check Id Status',
    description: 'Check Id Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  checkIdFailureReason: {
    internalId: 5,
    name: 'Check Id Failure Reason',
    description: 'Check Id Failure Reason',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  status: {
    internalId: 6,
    name: 'Status',
    description: 'Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  failureReason: {
    internalId: 7,
    name: 'Failure Reason',
    description: 'Failure Reason',
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
