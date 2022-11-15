import { map } from 'lodash'

import { ISheetValueRow } from '../../../helpers/arrays'
import { ChildBaseRun } from '../../../helpers/types'
import { ultron } from '../../ultron'
import { EXPORT_SHEET_FIELDS } from './constants'

const formatBaseRun = (data: ChildBaseRun) => {
  const result: Record<string, any> = {}
  data.baseRunVariables.forEach((brv) => {
    result[brv.baseVariable.name] = brv.value
  })
  result['baseRunId'] = data.id
  return result
}

const getChildBaseRuns = async ({
  parentBaseRunId,
  childBaseId,
}: {
  parentBaseRunId: string
  childBaseId: string
}) => {
  const result = await ultron.baseRun.findChildBaseRuns({
    parentBaseRunId,
    baseId: childBaseId,
  })

  return map(result, formatBaseRun)
}

const getSheetRowsForOSEExport = async (result: Record<string, any>[]) => {
  const sheetValues: ISheetValueRow[] = []

  result.forEach((item: any) => {
    const row: ISheetValueRow = []
    EXPORT_SHEET_FIELDS.forEach((field) => {
      row.push(item[field])
    })
    sheetValues.push(row)
  })

  return sheetValues
}

export { formatBaseRun, getChildBaseRuns, getSheetRowsForOSEExport }
