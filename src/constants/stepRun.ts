import { values } from 'lodash/fp'

const STEP_RUN_STATUSES = {
  DISABLED: 'disabled',
  DONE: 'done',
  FAILED: 'failed',
  PENDING: 'pending',
  QUEUED: 'queued',
  RUNNING: 'running',
} as const

const _STEP_RUN_STATUSES = values(STEP_RUN_STATUSES)

type TStepRunStatus = typeof _STEP_RUN_STATUSES[number]

export { _STEP_RUN_STATUSES, STEP_RUN_STATUSES }
export type { TStepRunStatus }
