import { getSheetData, getSpreadsheetId } from '../../../helpers/google/sheets'

async function importSheet({
  sheetUrl,
  sheetTab,
  restType,
}: {
  sheetUrl: string
  sheetTab: string
  restType: string
}) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'Batch',
    'Code',
    'Chain ID',
    'Firefly ID',
    'Name',
    'Address',
    'City',
    'State',
    'Zip Code',
    'URLs',
    'Phone Number',
  ]

  const result = await getSheetData({ spreadsheetId, tabName: sheetTab, columns })

  return result
}

export { importSheet }
