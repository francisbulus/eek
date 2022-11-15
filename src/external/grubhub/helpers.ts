import { forEach, map, reduce } from 'lodash'

import { ultron } from '../../external/ultron'
import { BusinessInstanceNotFound } from '../../helpers/errors'
import { BaseRun, ChildBaseRun } from '../../helpers/types'
import { UUIDs } from './constants'

const getAllGrubhubUsers = async () => {
  const users = await ultron.baseRun.findMany({
    where: { baseId: UUIDs.Bases.Users },
    includeBaseVariableIds: [UUIDs.BaseVariables.Name, UUIDs.BaseVariables.Email],
  })

  const userData = map(users, (user) => {
    const baseRunVariables = reduce(
      user.baseRunVariables,
      (result, baseRunVariable) => {
        if (baseRunVariable.baseVariableId === UUIDs.BaseVariables.Name) {
          result.name = baseRunVariable.value
        } else {
          result.email = baseRunVariable.value
        }

        return result
      },
      {} as { name: string; email: string }
    )

    return baseRunVariables
  })

  return userData
}

const autoAssignStep = async ({
  stepRunId,
  baseVariableId,
}: {
  stepRunId: string
  baseVariableId: string
}) => {
  const stepRun = await ultron.stepRun.findById(stepRunId)

  if (!stepRun)
    throw new BusinessInstanceNotFound(
      { name: 'stepRun', by: 'id', source: 'GrubHub Operate Auto Assign Automation' },
      { stepRunId }
    )

  const currentBaseRun = await ultron.baseRun.findById(stepRun.baseRunId)

  if (!currentBaseRun)
    throw new BusinessInstanceNotFound(
      { name: 'baseRun', by: 'id', source: 'GrubHub Operate Auto Assign Automation' },
      { baseRunId: stepRun.baseRunId }
    )

  let assigneeEmail = ''

  forEach(currentBaseRun.baseRunVariables, (baseRunVariable) => {
    if (baseRunVariable.baseVariableId === baseVariableId) {
      assigneeEmail = baseRunVariable.value
    }
  })

  const user = await ultron.user.findByEmail({ email: assigneeEmail })

  if (!user)
    throw new BusinessInstanceNotFound(
      { name: 'user', by: 'email', source: 'GrubHub Operate Automation' },
      { baseRunId: stepRun.baseRunId }
    )

  await ultron.stepRun.autoAssign({ stepRunId, userId: user.id })
}

const checkForBaseRunsWithValue = async ({ value, baseId }: { value: string; baseId: string }) => {
  let found = false

  const baseRuns = await ultron.baseRun.findMany({
    where: {
      baseId,
      baseRunVariables: { some: { value: { equals: value, path: [] } } },
    },
  })

  if (baseRuns.length > 0) found = true

  return found
}

const checkForActiveBaseRun = async ({ value, baseId }: { value: string; baseId: string }) => {
  let active = false

  const baseRuns = await ultron.baseRun.findMany({
    where: {
      baseId,
      baseRunVariables: { some: { value: { equals: value, path: [] } } },
      status: 'pending',
    },
  })

  if (baseRuns.length > 0) active = true

  return active
}

const fetchExistingBaseRunsValues = async ({
  baseId,
  baseVariableIds,
  status,
}: {
  baseId: string
  baseVariableIds: string[]
  status?: string
}) => {
  const baseRunIds: string[] = []
  const options: { baseId: string; status?: string } = {
    baseId,
  }
  if (status) options.status = 'pending'

  const baseRuns = await ultron.baseRun.findMany({
    where: options,
    includeBaseVariableIds: baseVariableIds,
  })
  if (baseRuns.length > 0) {
    baseRuns.forEach((br: BaseRun) =>
      br.baseRunVariables.forEach((brv: any) => {
        baseRunIds.push(brv.value)
      })
    )
  }
  return baseRunIds
}

const formatObject = (data: BaseRun | ChildBaseRun) => {
  const result: Record<string, any> = {}
  data.baseRunVariables.forEach((brv: any) => {
    result['baseRunId'] = data.id
    if (brv.baseVariable?.name) {
      result[brv.baseVariable?.name] = brv.value
      result[`${brv.baseVariable?.name} baseRunVariableId`] = brv.id
    }
    if (brv.baseVariableId) {
      result[brv?.baseVariableId] = brv.value
    }
  })
  return result
}

const getChildBaseRun = async ({
  stepBaseRunId,
  baseId,
}: {
  stepBaseRunId: string
  baseId: string
}) =>
  await ultron.baseRun.findChildBaseRuns({
    parentBaseRunId: stepBaseRunId,
    baseId,
  })

const getChildBaseRunItems = async ({
  stepBaseRunId,
  baseId,
}: {
  stepBaseRunId: string
  baseId: string
}) => {
  const data = await getChildBaseRun({
    stepBaseRunId,
    baseId,
  })
  return data ? map(data, formatObject) : []
}

export {
  autoAssignStep,
  checkForActiveBaseRun,
  checkForBaseRunsWithValue,
  fetchExistingBaseRunsValues,
  formatObject,
  getAllGrubhubUsers,
  getChildBaseRunItems,
}
