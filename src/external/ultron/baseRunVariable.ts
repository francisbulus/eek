import { BaseRunVariableUpdateManyInputArgs, BaseRunVariableValue } from '../../helpers/types'
import { ultronPut } from './helpers'
/**
 * Update many base run variables to the same value
 */
const updateManyOneValue = async ({
  baseRunVariableIds,
  value,
}: {
  baseRunVariableIds: string[]
  value: any
}): Promise<void> =>
  ultronPut({ path: `base-run-variables/batch/one-value`, body: { baseRunVariableIds, value } })

const updateByBaseRunId = async ({
  baseRunId,
  baseVariableId,
  value,
}: {
  baseRunId: string
  baseVariableId: string
  value: any
}): Promise<void> =>
  ultronPut({ path: `base-run-variables`, body: { baseRunId, baseVariableId, value } })

const duplicateCheck = async (
  baseVariableID: string,
  values: string[]
): Promise<BaseRunVariableValue[]> =>
  ultronPut({ path: `base-run-variables/findDuplicates`, body: { baseVariableID, values } })

const updateMany = async (data: BaseRunVariableUpdateManyInputArgs[]): Promise<void> =>
  ultronPut({ path: 'base-run-variables/batch', body: data as any })

const baseRunVariable = {
  updateByBaseRunId,
  updateManyOneValue,
  updateMany,
  duplicateCheck,
}

export { baseRunVariable }
