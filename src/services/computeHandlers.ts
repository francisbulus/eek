/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import logger from '@invisible/logger'
import { camelCase } from 'lodash'
import { IAutomationHandler, TStepTemplateStage } from 'src/helpers/types'
import { z } from 'zod'

import { ALL_HANDLERS } from '../automations'
import { ultron } from '../external/ultron'

const HandlerVariableSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  options: z.string().array().optional(),
  defaultKey: z.string().optional(),
  internalId: z.number(),
  required: z.boolean(),
  stage: z.enum(['build', 'scope', 'operate']).optional(),
})

const HandlerStepTemplateSchema = z.object({
  uid: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['full', 'semi']).optional(),
  tags: z.string().array().optional(),
  path: z.string(),
  automationLevel: z.enum(['full', 'semi']),
  synchronous: z.boolean().optional(),
  source: z.string().optional(),
  usesGenerator: z.boolean().optional(),
})

const StepTemplateVariableKeySchema = z.record(HandlerVariableSchema)
const StepTemplateVariableSchema = HandlerVariableSchema.omit({ internalId: true }).extend({
  key: z.string(),
  position: z.number(),
  direction: z.enum(['input', 'output']),
})
const StepTemplateSchema = HandlerStepTemplateSchema.omit({
  uid: true,
  automationLevel: true,
  type: true,
  usesGenerator: true,
}).extend({
  id: z.string(),
  variables: StepTemplateVariableSchema.array(),
  type: z.enum(['full_auto', 'semi_auto']),
})
export type TStepTemplate = z.TypeOf<typeof StepTemplateSchema>
type TStepTemplateVariable = z.TypeOf<typeof StepTemplateVariableSchema>
type TStepTemplateVariableKey = z.TypeOf<typeof StepTemplateVariableKeySchema>

// VALIDATORS
const validateFields = (handlers: Readonly<IAutomationHandler<any, any>>[]) => {
  try {
    handlers.forEach((handler) => {
      HandlerStepTemplateSchema.parse(handler)
      const templateVariables = { ...handler.inputs, ...handler.outputs }
      if (templateVariables) {
        const vKeys = Object.keys(templateVariables)
        vKeys.forEach((vKey) => HandlerVariableSchema.parse(templateVariables[vKey]))
      }
    })
  } catch (e: unknown) {
    logger.error(`Failed to validate handler fields: ${JSON.stringify(e)}`)
    process.exit(1)
  }
}

const checkDiff = (remoteUuids: string[], localUuids: string[]) =>
  localUuids.filter((x) => !remoteUuids.includes(x))

// PROCESSORS
const computeHandlers = async () => {
  const localUuids = Object.keys(ALL_HANDLERS)
  const compatibleLocalUuids = localUuids.filter((uui) => ALL_HANDLERS[uui].usesGenerator)

  let remoteUuids: string[]

  if (!compatibleLocalUuids.length) {
    logger.warn('Exiting as no local uuids were found to process')
    process.exit(0)
  }

  try {
    const pathResults = await ultron.stepTemplate.getPaths()
    remoteUuids = pathResults.map((res) => res.id)
  } catch (e) {
    logger.error(`Failed to fetch remote uuids: ${JSON.stringify(e)}`)
    process.exit(1)
  }

  let newUuids: string[] = []

  if (!remoteUuids.length) {
    logger.warn('No remote uuids found')
    newUuids = compatibleLocalUuids
  } else {
    newUuids = checkDiff(remoteUuids, compatibleLocalUuids)
  }

  const handlersToUse = newUuids.map((uuid) => ALL_HANDLERS[uuid])

  if (!handlersToUse.length) {
    logger.warn('Exiting as no new handlers were found for the given uuids')
    process.exit(0)
  }

  validateFields(handlersToUse)

  const stepTemplates = handlersToUse.map(buildStepTemplateForApi)

  const addedPaths: string[] = []
  const failedPaths: string[] = []

  for (const stepTemplate of stepTemplates) {
    try {
      await ultron.stepTemplate.createStepTemplate(stepTemplate)
      logger.info(`Successfully created step template ${stepTemplate.name}`)
      addedPaths.push(stepTemplate.path)
    } catch (e) {
      logger.error(`Failed to create step template ${stepTemplate.name}`)
      failedPaths.push(stepTemplate.path)
    }
  }

  if (failedPaths.length === newUuids.length) {
    logger.error('Failed to create any step template')
    process.exit(1)
  }

  console.log(`Successfully created templates with the following paths: ${addedPaths.join(', ')}`)

  if (failedPaths.length) {
    logger.warn(`Did not create templates with the following paths: ${failedPaths.join(', ')}`)
  }
}

// BUILDERS
const buildStepTemplateForApi = (
  handler: Readonly<IAutomationHandler<any, any>>
): TStepTemplate => {
  const variables = buildVariablesForApi(handler)
  return {
    id: handler.uid,
    name: handler.name,
    path: handler.path as string,
    ...(handler.description ? { description: handler.description } : {}),
    type: handler.automationLevel === 'full' ? 'full_auto' : 'semi_auto',
    ...(variables.length ? { variables } : { variables: [] }),
    ...(handler.synchronous ? { handler: handler.synchronous } : {}),
    source: 'process_automation',
  }
}

const buildVariablesForApi = (handler: Readonly<IAutomationHandler<any, any>>) => {
  if (!handler.inputs && !handler.outputs) return []
  let outputVars: TStepTemplateVariable[] = []
  let inputVars: TStepTemplateVariable[] = []
  if (handler.inputs) {
    const inputs = handler.inputs
    const inputVkeys = Object.keys(inputs)
    inputVars = inputVkeys.map((vKey) => constructVariableObj(inputs, vKey, 'input'))
  }
  if (handler.outputs) {
    const outputs = handler.outputs
    const outputVkeys = Object.keys(outputs)
    outputVars = outputVkeys.map((vKey) => constructVariableObj(outputs, vKey, 'output'))
  }

  return [...inputVars, ...outputVars]
}

const constructVariableObj = (
  variables: TStepTemplateVariableKey,
  vKey: string,
  direction: 'output' | 'input'
) => ({
  name: variables[vKey].name,
  direction,
  type: variables[vKey].type,
  ...(variables[vKey].description ? { description: variables[vKey].description } : {}),
  ...(variables[vKey].defaultKey ? { defaultKey: variables[vKey].defaultKey } : {}),
  position: variables[vKey].internalId,
  key: camelCase(variables[vKey].name),
  stage: variables[vKey].stage as TStepTemplateStage,
  required: variables[vKey].required,
  ...(variables[vKey].options ? { options: variables[vKey].options } : { options: [] }),
})

export { computeHandlers }
