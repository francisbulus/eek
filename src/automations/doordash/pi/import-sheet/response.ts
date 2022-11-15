import { forEach } from 'lodash'

import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({
  sheetUrl,
  sheetTab,
  batchId,
}: {
  sheetUrl: string
  sheetTab: string
  batchId: string
}) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'Inv #',
    'SUBMARKET_ID',
    'SUBMARKET_NAME',
    'BUSINESS_ID',
    'BUSINESS_NAME',
    'SEGMENT',
    'NAME',
    'STORE_ID',
    'STORE_NAME',
    'REGION_ID',
    'TIMEZONE',
    'PHONE_NUMBER',
    'STORE_ADDRESS',
    'ADDRESS',
    'ITEMS',
    'ITEM_NAME',
    'MISPRICED_ITEMS',
    'OVERPRICED_ITEMS',
    'PCT INFLATED',
    'AVG_REL_PRICE_DIFF',
    'CATEGORY_NAME',
    'DELIVERY_PRICE',
    'In-Store Item Price',
    'PU_PRICE',
  ]
  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  const filteredResult: any[] = []
  const storeMap = new Map<any, boolean>()
  forEach(result, (result1) => {
    const storeId = result1['STORE_ID']
    if (storeId != undefined && !storeMap.has(storeId)) {
      const items: any[] = []
      forEach(result, (result2) => {
        if (storeId === result2['STORE_ID']) {
          items.push({
            'Store ID': storeId,
            'Menu Category ID': result2['CATEGORY_NAME'],
            'Category Name': result2['CATEGORY_NAME'],
            'Item Name': result2['ITEM_NAME'],
            'Item ID': result2['ITEM_NAME'],
            'Delivery Price': result2['DELIVERY_PRICE'],
            'Pick Up Price': result2['PU_PRICE'],
            'In Store Item Price': result2['In-Store Item Price'],
            Notes: result2['Notes'],
          })
        }
      })
      const data = {
        ...result1,
        STORE_NAME: result1['NAME'],
        SEARCH_LINK: `https://www.google.com/search?q=${result1.NAME?.split(' ').join(
          '+'
        )}+${result1.ADDRESS?.split(' ').join('+')}`,
        Items: items,
        OUTPUT_ITEMS: items,
      }
      storeMap.set(storeId, true)
      filteredResult.push(data)
    }
  })
  return filteredResult
}

export { importSheet }
