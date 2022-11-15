import { map } from 'lodash'
import { keys } from 'lodash/fp'
import moment from 'moment'

import { ISheetValueRow } from '../../../../src/helpers/arrays'
import {
  EXPORT_ITEMS_SHEET_FIELDS,
  EXPORT_SHEET_FIELDS,
  ITEMS_BASE_ID,
  UUIDs,
} from '../../../external/doordash/ppr/constants'
import { ultron } from '../../../external/ultron'
import { BaseRun, ChildBaseRun } from '../../../helpers/types'

const formatBaseRun = (data: ChildBaseRun) => {
  const result: Record<string, any> = {}
  data.baseRunVariables.forEach((brv) => {
    result[brv.baseVariable.name] = brv.value
  })
  result['baseRunId'] = data.id
  return result
}

const formatItemsBaseVariables = (data: BaseRun) => {
  const result: Record<string, any> = {}
  data.baseRunVariables.forEach((brv) => {
    result[UUIDs.ItemsBase[brv.baseVariableId]] = brv.value
  })
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

const updateBaseRunVariables = async ({
  baseRunId,
  baseVariableId,
  value,
}: {
  baseRunId: string
  baseVariableId: string
  value: string
}) => {
  const result = await ultron.baseRunVariable.updateByBaseRunId({
    baseRunId,
    baseVariableId,
    value,
  })

  return result
}

const getSheetRowsForPPRExport = async (result: Record<string, any>[]) => {
  const sheetValues: ISheetValueRow[] = []
  for (const value of result) {
    const items = await ultron.baseRun.findMany({
      where: {
        baseId: ITEMS_BASE_ID,
        parentId: value.baseRunId,
      },
      includeBaseVariableIds: keys(UUIDs.ItemsBase),
    })
    const itemsFormattedValue = map(items, formatItemsBaseVariables)
    itemsFormattedValue.forEach((item: Record<string, any>) => {
      const row: ISheetValueRow = []
      EXPORT_SHEET_FIELDS.forEach((field) => {
        if (field === 'Online Price (Cents)') {
          if (item['Online Price']) {
            row.push(item['Online Price'])
          } else {
            row.push('')
          }
        } else if (field === 'Menu Source') row.push(value['Price Source'])
        else if (field === 'Menu Link') row.push(value['Website'])
        else if (field === 'Item Found') {
          if (
            item['Notes'] === 'Item Found In Different Category' ||
            item['Notes'] === 'Item Found with Different Name'
          )
            row.push(String(true))
          else row.push(String(!(item['Notes'] && item['Notes'] !== '')))
        } else if (field === 'Menu Update Date') {
          if (!value['Menu Update Date'] || value['Menu Update Date'] === '') {
            row.push('')
          } else {
            row.push(moment(new Date(value['Menu Update Date']).toUTCString()).format('MM/DD/YYYY'))
          }
        } else if (field === 'Audit Date') {
          if (!value['Operate At'] || value['Operate At'] === '') {
            row.push('')
          } else {
            row.push(moment(new Date(value['Operate At']).toUTCString()).format('MM/DD/YYYY'))
          }
        } else if (EXPORT_ITEMS_SHEET_FIELDS.includes(field)) row.push(item[field])
        else row.push(value[field])
      })
      sheetValues.push(row)
    })
  }
  return sheetValues
}

export {
  formatBaseRun,
  formatItemsBaseVariables,
  getChildBaseRuns,
  getSheetRowsForPPRExport,
  updateBaseRunVariables,
}
