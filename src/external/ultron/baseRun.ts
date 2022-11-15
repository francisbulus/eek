import { TBaseRunStatus } from '../../constants/baseRun'
import { BaseRun, BaseRunVariable, ChildBaseRun } from '../../helpers/types'
import { ultronGet, ultronPost, ultronPut } from './helpers'
/**
 * Find many base runs with the given criteria.
 *
 * includeBaseVariableIds is optional and
 */
const findMany = async ({
  where,
  includeBaseVariableIds,
}: {
  where: Record<string, unknown>
  includeBaseVariableIds?: string[]
}): Promise<BaseRun[]> =>
  // GCP load balancer doesn't allow GET with body, so we use POST here
  ultronPost({
    path: 'base-runs',
    body: {
      where,
      includeBaseVariableIds,
    },
  })

/**
 * Find all child baseRuns for a parent baseRun
 */
const findChildBaseRuns = async ({
  parentBaseRunId,
  baseId,
}: {
  parentBaseRunId: string
  baseId: string
}): Promise<ChildBaseRun[]> =>
  ultronPost({ path: 'base-runs/child-base-runs', body: { parentBaseRunId, baseId } })

/**
 * Create bulk base runs
 */
const createMany = async ({
  baseId,
  parentBaseRunId,
  initialValuesArray,
  returnCreated,
}: {
  baseId: string
  parentBaseRunId?: string
  initialValuesArray: Omit<BaseRunVariable, 'id'>[][]
  returnCreated?: boolean
}) =>
  ultronPost({
    path: 'base-runs/create-many',
    body: { baseId, parentBaseRunId, initialValuesArray, returnCreated },
  })

/**
 * Find a base run by id
 */
const findById = async (id: string): Promise<BaseRun> => ultronGet({ path: `base-runs/${id}` })

/**
 * Update a base run's variable value, by base variable id
 */
const updateVariableValue = async ({
  baseRunId,
  baseVariableId,
  value,
}: {
  baseRunId: string
  baseVariableId: string
  value: any
}): Promise<void> =>
  ultronPut({
    path: `base-runs/${baseRunId}/variables`,
    body: { baseRunId, baseVariableId, value },
  })

/**
 * Update a base run's status
 */
const updateStatus = async ({
  baseRunId,
  status,
}: {
  baseRunId: string
  status: TBaseRunStatus
}): Promise<BaseRun> =>
  ultronPut({ path: `base-runs/${baseRunId}/status`, body: { baseRunId, status } })

/**
 * Update many base runs to the same status
 */
const updateManyStatus = async ({
  baseRunIds,
  status,
}: {
  baseRunIds: string[]
  status: TBaseRunStatus
}): Promise<void> => ultronPut({ path: `base-runs/status`, body: { baseRunIds, status } })

const baseRun = {
  createMany,
  findChildBaseRuns,
  findById,
  findMany,
  updateManyStatus,
  updateStatus,
  updateVariableValue,
}

export { baseRun }
