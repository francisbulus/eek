import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'b13d2c05-5a81-495c-81c3-7d4bd4908295'
const name = 'Grubhub Users Import Automation for Manticore'
const path = 'grubhub/import-users'
const description = 'Import and validate Grubhub users from csv data'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  arrayOfUsers: {
    internalId: 1,
    name: 'Grubhub Users CSV Data',
    type: VARIABLE_TYPES.ARR_OBJECT,
    required: true,
  },
} as const

const outputs: TInputsOutputs = {
  validUsersArray: {
    internalId: 2,
    name: 'Array of valid & existing users',
    type: VARIABLE_TYPES.ARR_OBJECT,
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
