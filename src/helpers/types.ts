import { VercelApiHandler } from '@vercel/node'
import { NextApiHandler } from 'next'

import {
  IVariableTemplateCreateAttributes,
  TStepTemplateAutomationLevel,
  TStepTemplateCategoryId,
  TStepTemplateStatus,
} from '../constants'

type TVariableTemplateObj = Record<string, IVariableTemplateCreateAttributes>

type TInputsOutputs = Readonly<TVariableTemplateObj> | null

type TAutomationHandlerExecute = NextApiHandler | VercelApiHandler

type TStepTemplateStage = 'build' | 'scope' | 'operate'

interface IAutomationHandler<TInputs extends TInputsOutputs, TOutputs extends TInputsOutputs> {
  uid: string
  name: string
  path: string
  description?: string
  inputs: TInputs
  outputs: TOutputs
  allowRetry?: boolean
  synchronous?: boolean
  automationLevel?: TStepTemplateAutomationLevel
  status?: TStepTemplateStatus
  stepTemplateCategoryId?: TStepTemplateCategoryId
  external?: boolean
  meta?: Record<string, unknown>
  schema?: Record<string, any>
  execute: TAutomationHandlerExecute
  usesGenerator?: boolean
}

// Truncated types here cuz this is only the stuff we need for the dedupe steps
interface BaseRun {
  id: string
  baseRunVariables: BaseRunVariable[]
  parentId?: string | null
  baseId?: string | null
  status: string
}

interface ChildBaseRun {
  id: string
  baseId: string
  baseRunVariables: (Omit<BaseRunVariable, 'baseVariableId'> & {
    baseVariable: { id: string; name: string }
  })[]
}

interface StepRun {
  id: string
  stepId: string
  assigneeId: string
  baseRunId: string
  assignee?: {
    name: string
  }
}

interface BaseRunVariable {
  id: string
  value: any
  baseVariableId: string
}

interface BaseRunVariableValue {
  value: string
}

interface BaseRunVariableUpdateManyInputArgs {
  baseRunVariableId: string
  baseVariableId: string
  baseRunId: string
  value: any
}

interface User {
  id: string
  email: string
  name: string
}

export enum ValueRenderOption {
  FORMULA = 'FORMULA',
  UNFORMATTED_VALUE = 'UNFORMATTED_VALUE',
  FORMATTED_VALUE = 'FORMATTED_VALUE',
}

export type {
  BaseRun,
  BaseRunVariable,
  BaseRunVariableUpdateManyInputArgs,
  BaseRunVariableValue,
  ChildBaseRun,
  IAutomationHandler,
  StepRun,
  TInputsOutputs,
  TStepTemplateStage,
  TVariableTemplateObj,
  User,
}
