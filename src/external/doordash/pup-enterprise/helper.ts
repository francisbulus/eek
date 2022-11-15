import { map } from 'lodash'
import { keys } from 'lodash/fp'
import moment from 'moment'

import { ISheetValueRow } from '../../../../src/helpers/arrays'
import { ultron } from '../../../external/ultron'
import { BaseRun, ChildBaseRun } from '../../../helpers/types'
import { EXPORT_SHEET_FIELDS, ITEMS_BASE_ID, UUIDs } from './constants'

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

const getSheetRowsForPUPEnterpriseExport = async (result: Record<string, any>[]) => {
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
      const values = { ...value, ...item }
      const fieldKeyMap: Record<string, string> = {
        SUBMARKET_ID: 'Submarket ID',
        SUBMARKET_NAME: 'Submarket Name',
        BUSINESS_GROUP_ID: 'Business Group',
        BUSINESS_ID: 'Business ID',
        BUSINESS_NAME: 'Business Name',
        STORE_RANK_NEW: 'Store Rank New',
        STORE_ID: 'Store ID',
        STORE_NAME: 'Store Name',
        PHONE_NUMBER: 'Phone Number',
        Address: 'Address',
        MENU_CATEGORY: 'Menu Category',
        CATEGORY_RANKING: 'Category Ranking',
        ITEM_ID: 'Item ID',
        ITEM_NAME: 'Item Name',
        TAG: 'Tag',
        ENTREE: 'Entree',
        ITEM_DELIV_PRICE: 'Item Deliv Price',
        ITEM_RANK: 'Item Rank',
        ITEM_RANK_FINAL: 'Item Rank Final',
        OPERATOR: 'Operator',
        'Store Menu URL': 'Store Menu URL',
        'Store Menu Item Price': 'Store Menu Item Price',
        'Store Menu Item Found': 'Store Menu Item Found',
        'Store Menu Item Screenshot #1': 'Store Menu Item Screenshot 1',
        'Store Menu Item Screenshot #2': 'Store Menu Item Screenshot 2',
        'Store Menu Item Screenshot #3': 'Store Menu Item Screenshot 3',
        'DoorDash Menu URL': 'Doordash Menu URL',
        'DoorDash Menu Item Price': 'Doordash Menu Item Price',
        'DoorDash Menu Item Found': 'Doordash Menu Item Found',
        'DoorDash Menu Item Screenshot #1': 'DoorDash Menu Item Screenshot 1',
        'DoorDash Menu Item Screenshot #2': 'DoorDash Menu Item Screenshot 2',
        'DoorDash Menu Item Screenshot #3': 'DoorDash Menu Item Screenshot 3',
        Notes: 'Notes',
        AUDITOR: 'Auditor',
        'SELECTED FOR AUDIT': 'Selected for Audit',
        'AUDITOR NOTES': 'Audit Note',
        'CORRECTED?': 'Corrected',
      }
      EXPORT_SHEET_FIELDS.forEach((field) => {
        if (field === 'AUDIT DATE') {
          if (!values['Audit Date'] || values['Audit Date'] === '') {
            row.push('')
          } else {
            row.push(moment(new Date(values['Audit Date']).toUTCString()).format('MM/DD/YYYY'))
          }
          return
        } else if (field === 'PASS/FAIL') {
          if (!values['Audit Outcome']) {
            row.push('')
          } else if (values['Audit Outcome'] === false) {
            row.push('FAIL')
          } else {
            row.push('PASS')
          }
          return
        } else if (field === 'DoorDash Menu Item Screenshot #1') {
          return !values['DoorDash Menu Item Screenshot 1']
            ? row.push('')
            : row.push(`=IMAGE("${values['DoorDash Menu Item Screenshot 1']}")`)
        } else if (field === 'DoorDash Menu Item Screenshot #2') {
          return !values['DoorDash Menu Item Screenshot 2']
            ? row.push('')
            : row.push(`=IMAGE("${values['DoorDash Menu Item Screenshot 2']}")`)
        } else if (field === 'DoorDash Menu Item Screenshot #3') {
          return !values['DoorDash Menu Item Screenshot 3']
            ? row.push('')
            : row.push(`=IMAGE("${values['DoorDash Menu Item Screenshot 3']}")`)
        } else if (field === 'Store Menu Item Screenshot #1') {
          return !values['Store Menu Item Screenshot 1']
            ? row.push('')
            : row.push(`=IMAGE("${values['Store Menu Item Screenshot 1']}")`)
        } else if (field === 'Store Menu Item Screenshot #2') {
          return !values['Store Menu Item Screenshot 2']
            ? row.push('')
            : row.push(`=IMAGE("${values['Store Menu Item Screenshot 2']}")`)
        } else if (field === 'Store Menu Item Screenshot #3') {
          return !values['Store Menu Item Screenshot 3']
            ? row.push('')
            : row.push(`=IMAGE("${values['Store Menu Item Screenshot 3']}")`)
        } else if (field === 'SELECTED FOR AUDIT') {
          return !values['Audit Date'] ? row.push('') : row.push('True')
        }
        return row.push(values[fieldKeyMap[field]])
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
  getSheetRowsForPUPEnterpriseExport,
  updateBaseRunVariables,
}
