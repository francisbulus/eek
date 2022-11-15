import { TStepTemplateStage } from 'src/helpers/types'

import { TVariableTypes } from './variable'

interface IVariableTemplateCreateAttributes {
  internalId: number
  name: string
  description?: string
  required: boolean
  type: TVariableTypes
  stageId?: number
  keyName?: string
  defaultValue?: string
  meta?: Record<string, unknown>
  schema?: Record<string, unknown>
  sampleData?: Record<string, unknown> | any[]
  stage?: TStepTemplateStage
}

export type { IVariableTemplateCreateAttributes }
