import { STEP_TEMPLATE_AUTOMATION_LEVELS, VARIABLE_TYPES } from '../../../constants'
import { IAutomationHandler, TInputsOutputs } from '../../../helpers/types'
import execute from './index'

const uid = 'f2e98945-3ca4-4700-98fb-528e28f449f1'
const name = 'Datassential Publish Items'
const path = 'datassential/publish-items'
const description = 'Datassential Restaurants Publish Items automation'
const automationLevel = STEP_TEMPLATE_AUTOMATION_LEVELS.FULL
const allowRetry = false
const synchronous = true

const inputs: TInputsOutputs = {
  restCode: {
    internalId: 1,
    name: 'Restaurant Code',
    type: VARIABLE_TYPES.STRING,
    required: true,
  },
}

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
