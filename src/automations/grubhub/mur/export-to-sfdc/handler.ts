import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../../helpers/types'
import execute from './index'

const uid = '876b6d0c-2960-45ec-9d18-b4ba8f948189'
const name = 'GrubHub MUR Upload'
const path = 'grubhub/mur/export-to-sfdc'
const description = 'Uploads Cases after completion GrubHub MUR Process'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  errorsBaseId: {
    internalId: 1,
    name: 'Errors Base ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  caseNumberId: {
    internalId: 1,
    name: 'Case Number ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  parentCaseNumberId: {
    internalId: 1,
    name: 'Parent Case Number ID',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  uploadStatus: {
    internalId: 2,
    name: 'Upload Status',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
  qualityScore: {
    internalId: 3,
    name: 'Quality Score',
    type: VARIABLE_TYPES.STRING,
    required: false,
  },
  uploadText: {
    internalId: 4,
    name: 'Upload Text',
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
