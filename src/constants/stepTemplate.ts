import { values } from 'lodash/fp'

const STEP_TEMPLATE_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
} as const

const STEP_TEMPLATE_AUTOMATION_LEVELS = {
  FULL: 'full',
  SEMI: 'semi',
  MANUAL: 'manual',
} as const

const _STEP_TEMPLATE_STATUSES = values(STEP_TEMPLATE_STATUSES)
const _STEP_TEMPLATE_AUTOMATION_LEVELS = values(STEP_TEMPLATE_AUTOMATION_LEVELS)

type TStepTemplateStatus = typeof _STEP_TEMPLATE_STATUSES[number]
type TStepTemplateAutomationLevel = typeof _STEP_TEMPLATE_AUTOMATION_LEVELS[number]

export {
  _STEP_TEMPLATE_AUTOMATION_LEVELS,
  _STEP_TEMPLATE_STATUSES,
  STEP_TEMPLATE_AUTOMATION_LEVELS,
  STEP_TEMPLATE_STATUSES,
}

export type { TStepTemplateAutomationLevel, TStepTemplateStatus }
