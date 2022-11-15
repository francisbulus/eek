const BaseRunStatus = {
  pending: 'pending',
  running: 'running',
  failed: 'failed',
  done: 'done',
  disabled: 'disabled',
  snoozed: 'snoozed',
}

export type TBaseRunStatus = keyof typeof BaseRunStatus
