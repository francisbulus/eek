import { StepRun } from '../../helpers/types'
import { ultronGet, ultronPost } from './helpers'

/**
 * Finds a step run by id
 */
const findById = async (id: string): Promise<StepRun> => ultronGet({ path: `step-runs/${id}` })
const find = async (query: any): Promise<StepRun> => ultronGet({ path: `step-runs`, query })

/**
 * Auto assigns an automated step to a user on manticore
 */
const autoAssign = async ({ stepRunId, userId }: { stepRunId: string; userId: string }) =>
  ultronPost({ path: 'step-runs/assign-without-validations', body: { stepRunId, userId } })

/**
 * Snooze step run
 *
 */
const snooze = async ({
  stepRunId,
  snoozeUntil,
}: {
  stepRunId: string
  snoozeUntil?: Date
}): Promise<StepRun> => ultronPost({ path: 'step-runs/snooze', body: { stepRunId, snoozeUntil } })

const findGoFromStepRuns = async ({ stepRun }: { stepRun: StepRun }): Promise<StepRun[]> =>
  ultronPost({ path: 'step-runs/find-go-from-step-runs', body: { stepRun } })

const stepRun = { autoAssign, findById, find, findGoFromStepRuns, snooze }

export { stepRun }
