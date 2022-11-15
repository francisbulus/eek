import { find } from 'lodash/fp'

import { BaseRun, BaseRunVariable } from '../types'

/**
 * Given a base run with its embedded base run variables,
 * return the value of the base run variable matching the baseVariableId
 */
const getBaseRunVariableValue = ({
  baseVariableId,
  baseRun,
}: {
  baseVariableId: string
  baseRun: BaseRun
}) => {
  const brv = getBaseRunVariable({ baseVariableId, baseRun })
  if (!brv) return undefined
  return brv.value
}

/**
 * Given a base run with its embedded base run variables,
 * return the base run variable matching the baseVariableId
 */
const getBaseRunVariable = ({
  baseVariableId,
  baseRun,
}: {
  baseVariableId: string
  baseRun: BaseRun
}) => {
  const brv = find({ baseVariableId }, baseRun.baseRunVariables) as BaseRunVariable | undefined
  if (!brv) return undefined
  return brv
}

export { getBaseRunVariable, getBaseRunVariableValue }
