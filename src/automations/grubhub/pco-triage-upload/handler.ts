import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'b645218a-5ebc-4f1b-bcd5-47b76cfefa1a'
const name = 'GrubHub PCO Triage Upload'
const path = 'grubhub/pco-triage-upload'
const description = 'Uploads Cases after completion GrubHub PCO Triage Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  caseNumber: {
    internalId: 1,
    name: 'Case Number',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  custID: {
    internalId: 1,
    name: 'Customer ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  actionTaken: {
    internalId: 1,
    name: 'Action Taken',
    type: VARIABLE_TYPES.STRING,
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
