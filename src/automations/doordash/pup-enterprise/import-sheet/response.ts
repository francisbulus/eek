import { forEach } from 'lodash'

import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({
  sheetUrl,
  sheetTab,
  maxImagesAllowed,
}: {
  sheetUrl: string
  sheetTab: string
  maxImagesAllowed: number
}) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)
  const columns = [
    'SUBMARKET_ID',
    'SUBMARKET_NAME',
    'BUSINESS_GROUP_ID',
    'BUSINESS_ID',
    'BUSINESS_NAME',
    'SEGMENT',
    'STORE_RANK_NEW',
    'STORE_ID',
    'STORE_NAME',
    'PHONE_NUMBER',
    'ADDRESS',
    'MENU_CATEGORY',
    'CATEGORY_RANKING',
    'ITEM_ID',
    'ITEM_NAME',
    'TAG',
    'ENTREE',
    'ITEM_DELIV_PRICE',
    'ITEM_PU_PRICE',
    'ITEM_RANK',
    'ITEM_RANK_FINAL',
  ]

  const sheetData = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  const filteredResult: any[] = []
  const storeMap = new Map<any, boolean>()

  forEach(sheetData, (result1) => {
    const storeId = result1['STORE_ID']
    if (!storeMap.has(storeId)) {
      const items: any[] = []
      forEach(sheetData, (result2) => {
        if (storeId === result2['STORE_ID']) {
          items.push({
            STORE_ID: storeId,
            MENU_CATEGORY: result2['MENU_CATEGORY'],
            CATEGORY_RANKING: result2['CATEGORY_RANKING'],
            ITEM_ID: result2['ITEM_ID'],
            ITEM_NAME: result2['ITEM_NAME'],
            TAG: result2['TAG'],
            ENTREE: result2['ENTREE'],
            ITEM_DELIV_PRICE: result2['ITEM_DELIV_PRICE'],
            ITEM_PU_PRICE: result2['ITEM_PU_PRICE'],
            ITEM_RANK: result2['ITEM_RANK'],
            ITEM_RANK_FINAL: result2['ITEM_RANK_FINAL'],
          })
        }
      })
      const data = {
        SUBMARKET_ID: result1['SUBMARKET_ID'],
        SUBMARKET_NAME: result1['SUBMARKET_NAME'],
        BUSINESS_GROUP_ID: result1['BUSINESS_GROUP_ID'],
        BUSINESS_ID: result1['BUSINESS_ID'],
        BUSINESS_NAME: result1['BUSINESS_NAME'],
        SEGMENT: result1['SEGMENT'],
        STORE_RANK_NEW: result1['STORE_RANK_NEW'],
        STORE_ID: result1['STORE_ID'],
        STORE_NAME: result1['STORE_NAME'],
        PHONE_NUMBER: result1['PHONE_NUMBER'],
        ADDRESS: result1['ADDRESS'],
        'Max Images': maxImagesAllowed,
        Items: items,
      }
      storeMap.set(storeId, true)
      filteredResult.push(data)
    }
  })

  return filteredResult
}

export { importSheet }
