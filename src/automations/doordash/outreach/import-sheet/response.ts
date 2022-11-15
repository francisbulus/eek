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
    'INV #',
    'STORE_ID',
    'STORE_NAME',
    'SUBMARKET_ID',
    'SUBMARKET_NAME',
    'TIMEZONE',
    'PHONE_NUMBER',
    'STORE_ADDRESS',
    'VOLUME',
    'ITEMS',
    'MISPRICED_ITEMS',
    'OVERPRICED_ITEMS',
    'PCT INFLATED',
    'AVG_REL_PRICE_DIFF',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  return result.map((row) => ({
    ...row,
    SEARCH_LINK: `http://www.google.com/search?q=${row.STORE_NAME?.split(' ').join(
      '+'
    )}+${row.STORE_ADDRESS?.split(' ').join('+')}`,
  }))
}

export { importSheet }
