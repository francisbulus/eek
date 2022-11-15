import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({ sheetUrl, sheetTab }: { sheetUrl: string; sheetTab: string }) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'COMPANY_CLEAN',
    'ROLE',
    'GCID',
    'LEAD_ID',
    'MX_DB_ID',
    'RESTAURANT_NAME',
    'STREET',
    'CITY',
    'STATE',
    'COUNTRY',
    'ZIP_CODE',
    'PHONE',
    'EMAIL',
    'PRIORITY',
    'GOOGLE PANEL NAME',
    'GOOGLE PANEL ADDRESS',
    'Is this restaurant in business? (Y / N / Temporarily Closed)',
    'Phone (Add any number from reliable source, if the same phone number as column K please carry over to column T)',
    'Website',
    'Facebook',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  return result.map((row) => ({
    ...row,
    SEARCH_LINK: `http://www.google.com/search?q=${row.RESTAURANT_NAME?.split(' ').join(
      '+'
    )}+${row.STREET?.split(' ').join('+')}`,
  }))
}

export { importSheet }
