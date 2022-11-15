import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({ sheetURL, sheetTab }: { sheetURL: string; sheetTab: string }) {
  const spreadsheetId = getSpreadsheetId(sheetURL)

  const columns = [
    'SERIAL_NUMBER',
    'BUSINESS_NAME',
    'ADDRESS',
    'PHONE_NUMBER',
    'ACCOUNT_OWNER',
    'STORE_COUNT',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  return result
}

export { importSheet }
