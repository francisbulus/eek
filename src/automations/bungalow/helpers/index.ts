import { compact, each, filter, flow, groupBy, map, sortBy, values } from 'lodash/fp'

import { ultron } from '../../../external/ultron'
import { BusinessInstanceNotFound } from '../../../helpers/errors'
import { moment } from '../../../helpers/moment'
import { BaseRun } from '../../../helpers/types'
import { getBaseRunVariable, getBaseRunVariableValue } from '../../../helpers/ultron/baseRun'
import { DUPLICATE_BASE_VARIABLE_ID, LEAD_BASE_ID } from './constants'

const THIRTY_DAYS_AGO = moment.utc().subtract('30', 'days').toDate()

/**
 * Mark many bungalow leads baseRuns as duplicate.
 */
const markManyAsDuplicate = async (baseRuns: BaseRun[]) => {
  const baseRunVariableIds = compact(
    map(
      (baseRun) =>
        getBaseRunVariable({
          baseVariableId: DUPLICATE_BASE_VARIABLE_ID,
          baseRun,
        })?.id,
      baseRuns
    )
  )

  return ultron.baseRunVariable.updateManyOneValue({
    baseRunVariableIds,
    value: true,
  })
}

/**
 * Mark many bungalow leads baseRuns as non-duplicate.
 */
const markManyAsNonDuplicate = async (baseRuns: BaseRun[]) => {
  const baseRunVariableIds = compact(
    map(
      (baseRun) =>
        getBaseRunVariable({
          baseVariableId: DUPLICATE_BASE_VARIABLE_ID,
          baseRun,
        })?.id,
      baseRuns
    )
  )
  return ultron.baseRunVariable.updateManyOneValue({
    baseRunVariableIds,
    value: false,
  })
}

/**
 * Given an id of a de-dupe (by phone, or by address) stepRun,
 * return the current (i.e. same batch) and recent leads (within 30 days).
 */
const getCurrentAndRecentLeads = async ({
  stepRunId,
  includeBaseVariableIds,
}: {
  stepRunId: string
  includeBaseVariableIds?: string[]
}) => {
  const stepRun = await ultron.stepRun.findById(stepRunId)
  // Get current batch baseRun to get "Batch" variable

  if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

  const currentBatch = await ultron.baseRun.findById(stepRun.baseRunId)
  if (!currentBatch)
    throw new BusinessInstanceNotFound(
      { name: 'baseRun', by: 'id' },
      { baseRunId: stepRun.baseRunId }
    )

  const [current, recent] = await Promise.all([
    ultron.baseRun.findMany({
      where: {
        baseId: LEAD_BASE_ID,
        parentId: currentBatch.id,
      },
      includeBaseVariableIds,
    }),
    ultron.baseRun.findMany({
      where: {
        baseId: LEAD_BASE_ID,
        parentId: { not: currentBatch.id },
        createdAt: { gte: THIRTY_DAYS_AGO },
      },
      includeBaseVariableIds,
    }),
  ])

  return { current, recent }
}

/**
 * Given an id of a de-dupe (by phone, or by address) stepRun,
 * return the current (i.e. same batch) leads.
 */
const getCurrentLeads = async ({
  stepRunId,
  includeBaseVariableIds,
}: {
  stepRunId: string
  includeBaseVariableIds?: string[]
}) => {
  const stepRun = await ultron.stepRun.findById(stepRunId)
  // Get current batch baseRun to get "Batch" variable

  if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

  const currentBatch = await ultron.baseRun.findById(stepRun.baseRunId)
  if (!currentBatch)
    throw new BusinessInstanceNotFound(
      { name: 'baseRun', by: 'id' },
      { baseRunId: stepRun.baseRunId }
    )
  return ultron.baseRun.findMany({
    where: {
      baseId: LEAD_BASE_ID,
      parentId: currentBatch.id,
    },
    includeBaseVariableIds,
  })
}

/**
 * Curried function to filter by the given value of the duplicate base run variable
 */
const filterByDupeValue = (v: boolean | null) => (baseRunGroup: BaseRun[]) =>
  sortBy(
    // We sort by id for idempotency
    'id',
    filter(
      (baseRun) =>
        getBaseRunVariableValue({
          baseVariableId: DUPLICATE_BASE_VARIABLE_ID,
          baseRun,
        }) === v,
      baseRunGroup
    )
  )

/**
 * Get all the base runs that have a null duplicate variable value
 */
const getNullDupeBaseRuns = filterByDupeValue(null)

/**
 * Get all the base runs that have a duplicate variable value of false
 */
const getFalseDupeBaseRuns = filterByDupeValue(false)

/**
 * Given an array of arrays of baseRuns, splits them into arrays of base runs that should be marked as duplicate, non-duplicate.
 * Something that was previously marked as duplicate can not be marked as a non-duplicate, but something that was previously marked as a non-duplicate CAN be marked as a duplicate.
 */
const getDuplicatesInGroups = (baseRunGroups: BaseRun[][]) => {
  const duplicateBaseRuns: BaseRun[] = []
  const nonDuplicateBaseRuns: BaseRun[] = []

  each((baseRunGroup: BaseRun[]) => {
    // We only care about base runs that were either never marked (null)
    // or were previously marked as false.
    // We ignore base runs that were previously marked as true.

    const nullDupeBaseRuns = getNullDupeBaseRuns(baseRunGroup)
    const falseDupeBaseRun = getFalseDupeBaseRuns(baseRunGroup)

    if (falseDupeBaseRun.length === 1) {
      // We already have exactly one non-duplicate in the group

      duplicateBaseRuns.push(...nullDupeBaseRuns)
    } else if (falseDupeBaseRun.length > 1) {
      // more than one non-duplicate in the group

      // Mark all but the first one as duplicate
      duplicateBaseRuns.push(...falseDupeBaseRun.slice(1))
      duplicateBaseRuns.push(...nullDupeBaseRuns)
    } else {
      // falseDupeBaseRun.length === 0
      const nonDuplicate = nullDupeBaseRuns.shift()
      if (nonDuplicate) {
        nonDuplicateBaseRuns.push(nonDuplicate)
      } else {
        // All the base runs in the group were previously marked as duplicates, skip
        return
      }

      duplicateBaseRuns.push(...nullDupeBaseRuns)
    }
  }, baseRunGroups)

  return { duplicateBaseRuns, nonDuplicateBaseRuns }
}

/**
 * Given an array of arrays of baseRuns, mark the duplicates and non-duplicates.
 * Returns an array of all the non-duplicates.
 */
const markAllDuplicatesInGroups = async (baseRunGroups: BaseRun[][]): Promise<BaseRun[]> => {
  const { nonDuplicateBaseRuns, duplicateBaseRuns } = getDuplicatesInGroups(baseRunGroups)

  await markManyAsDuplicate(duplicateBaseRuns)
  await ultron.baseRun.updateManyStatus({
    baseRunIds: map('id', duplicateBaseRuns),
    status: 'done',
  })
  await markManyAsNonDuplicate(nonDuplicateBaseRuns)
  return nonDuplicateBaseRuns
}

/**
 * Given a set of baseRuns and a isDuplicateFn function,
 * mark the duplicates and set the status to done for any baseRuns where isDuplicateFn is true,
 * and it's not already marked as duplicate
 */
const deduplicateBy = async ({
  baseRuns,
  isDuplicateFn,
}: {
  baseRuns: BaseRun[]
  isDuplicateFn: (baseRun: BaseRun) => boolean
}): Promise<void> => {
  const duplicateBaseRuns: BaseRun[] = []
  const nonDuplicateBaseRuns: BaseRun[] = []

  each((baseRun) => {
    const isDuplicated = isDuplicateFn(baseRun)

    // isAlreadyDuplicated can be true, false, or null
    const isAlreadyDuplicated: boolean | null = getBaseRunVariableValue({
      baseVariableId: DUPLICATE_BASE_VARIABLE_ID,
      baseRun,
    })

    // Already marked as duplicate, so don't touch
    if (isAlreadyDuplicated === true) return

    // Null, or previously marked as a non-duplicate, but is now a duplicate
    // so mark it as duplicate
    if (isDuplicated && (isAlreadyDuplicated === false || isAlreadyDuplicated === null)) {
      duplicateBaseRuns.push(baseRun)
      return
    }

    // Not a duplicate, and was not previously marked
    if (!isDuplicated && isAlreadyDuplicated === null) {
      nonDuplicateBaseRuns.push(baseRun)
      return
    }
  }, baseRuns)

  await markManyAsDuplicate(duplicateBaseRuns)
  await markManyAsNonDuplicate(nonDuplicateBaseRuns)
  await ultron.baseRun.updateManyStatus({
    baseRunIds: map('id', duplicateBaseRuns),
    status: 'done',
  })
}

type TAddGroupKeyFn = (baseRun: BaseRun) => { baseRun: BaseRun; groupKey: string } | undefined

const buildBaseRunGroupsBy = (addGroupKey: TAddGroupKeyFn) => (baseRunsToDeduplicate: BaseRun[]) =>
  flow(
    map(addGroupKey),
    compact,
    groupBy('groupKey'),
    values, // [ [ BaseRun ] ]
    map((group) => map('baseRun', group))
  )(baseRunsToDeduplicate) as BaseRun[][]

export {
  buildBaseRunGroupsBy,
  deduplicateBy,
  filterByDupeValue,
  getCurrentAndRecentLeads,
  getCurrentLeads,
  getDuplicatesInGroups,
  getFalseDupeBaseRuns,
  getNullDupeBaseRuns,
  markAllDuplicatesInGroups,
}

export type { TAddGroupKeyFn }
