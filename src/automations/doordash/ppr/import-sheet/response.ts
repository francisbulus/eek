import { forEach } from 'lodash'

import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({
  sheetUrl,
  sheetName,
  sheetTab,
  receivedAt,
}: {
  sheetUrl: string
  sheetName: string
  sheetTab: string
  receivedAt: string
}) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)
  const columns = [
    'Region ID',
    'Submarket ID',
    'Submarket Name',
    'Business ID',
    'Business Name',
    'Segment',
    'Store Rank',
    'Store ID',
    'Store Name',
    'Phone Number',
    'Address',
    'Menu Category',
    'Item ID',
    'Item Name',
    'Entree',
    'Tag',
    'Item Price',
    'Item Rank',
    'Menu Source',
    'Menu Link',
    'Menu Update Date',
    'Online Price (Cents)',
    'Notes',
    'Item Found',
    'Provided Menu URL',
  ]

  const sheetData = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  const filteredResult: any[] = []
  const storeMap = new Map<any, boolean>()

  forEach(sheetData, (result1) => {
    const storeId = result1['Store ID']
    if (!storeMap.has(storeId)) {
      const items: any[] = []
      forEach(sheetData, (result2) => {
        if (storeId === result2['Store ID']) {
          items.push({
            'Store ID': storeId,
            'Menu Category': result2['Menu Category'],
            'Item ID': result2['Item ID'],
            'Item Name': result2['Item Name'],
            Tag: result2['Tag'],
            Entree: result2['Entree'],
            'Item Price': result2['Item Price'],
            'Item Rank': result2['Item Rank'],
            'Online Price': result2['Online Price (Cents)'],
            Notes: result2['Notes'],
          })
        }
      })
      const data = {
        'File Name': sheetName,
        'GDrive Link': spreadsheetId,
        'Tab Name': sheetTab,
        'Region ID': result1['Region ID'],
        'Submarket ID': result1['Submarket ID'],
        'Submarket Name': result1['Submarket Name'],
        'Business ID': result1['Business ID'],
        'Business Name': result1['Business Name'],
        Segment: result1['Segment'],
        'Store Rank': result1['Store Rank'],
        'Store ID': result1['Store ID'],
        'Store Name': result1['Store Name'],
        'Phone Number': result1['Phone Number'],
        Address: result1['Address'],
        'Price Source': result1['Menu Source'],
        Website: result1['Menu Link'],
        'Menu Update Date': result1['Menu Update Date'],
        'Received At': new Date(receivedAt).toUTCString(),
        'Country Name': result1['Address']?.split(',')?.pop()?.replace(' ', ''),
        'Provided Menu URL': result1['Provided Menu URL'] || '',
        Items: items,
      }
      storeMap.set(storeId, true)
      filteredResult.push(data)
    }
  })
  return filteredResult
}

export { importSheet }
