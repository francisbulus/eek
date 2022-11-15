import pMap from 'p-map'

import { GDRIVE_EXPORT_FOLDER_ID } from '../../../../external/doordash/sie/constants'
import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'
import { exportToSheets } from '../export-batch/response'

async function importSheet({ sheetUrls, batchId }: { sheetUrls: string; batchId: string }) {
  const sheets = sheetUrls.trim().split(',')
  const finalResult: ITable = []

  const sheetTab = 'Sheet1'

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
    '# of Attempt',
    'IS MERCHANT NAME MATCHING?',
    'IS PHONE NUMBER VALID?',
    'IF NOT VALID, WHAT IS THE CORRECT PHONE NUMBER?',
    'PERM CLOSED?',
    'PERM CLOSED SOURCE',
    'IF PERM CLOSED SOURCE = OTHER, PLEASE SPECIFY SOURCE',
    'WHAT TYPE OF ESTABLISHMENT IS THIS?',
    'IF ESTABLISHMENT = OTHER, PLEASE SPECIFY',
    '"Notes(Please mark as ""DONE"" if no further action is required)"',
  ]

  await pMap(
    sheets,
    async (sheet) => {
      const spreadsheetId = getSpreadsheetId(sheet)
      const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable
      if (result && result.length > 0) finalResult.push(...result)
    },
    { concurrency: 1 }
  )

  const sheetUrl = await exportToSheets({
    batchId,
    driveFolderKey: GDRIVE_EXPORT_FOLDER_ID,
    data: finalResult,
  })
  return sheetUrl
}

export { importSheet }
