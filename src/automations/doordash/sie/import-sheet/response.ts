import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({ sheetUrl, sheetTab }: { sheetUrl: string; sheetTab: string }) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'ID',
    'COMPANY NAME',
    'STREET',
    'CITY',
    'STATE',
    'ZIP_CODE',
    'COUNTRY',
    'PHONE',
    'GOOGLE_LINK',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  return result.map((row) => ({
    'Store ID': row.ID,
    'Company Name': row['COMPANY NAME'],
    Street: row.STREET,
    City: row.CITY,
    State: row.STATE,
    'Zip Code': row.ZIP_CODE,
    Country: row.COUNTRY,
    'Phone Nr': row.PHONE,
    'Google Link': row.GOOGLE_LINK,
  }))
}

export { importSheet }
