import {
  CASES_BASE_ID,
  EXPORT_SHEET_FIELDS,
  GDRIVE_EXPORT_FOLDER_ID,
} from '../../../../external/doordash/ose/constants'
import {
  getChildBaseRuns,
  getSheetRowsForOSEExport,
} from '../../../../external/doordash/ose/helper'
import { ISheetValueRow } from '../../../../helpers/arrays'
import {
  addSpreadsheetParent,
  appendRows,
  createSpreadsheet,
  getSpreadsheetUrl,
} from '../../../../helpers/google/sheets'

const createGoogleSheet = async ({ title }: { title: string }) => {
  const spreadsheetId = await createSpreadsheet({ title })

  if (!spreadsheetId) throw new Error(`Couldn't create spreadsheet`)

  if (GDRIVE_EXPORT_FOLDER_ID)
    await addSpreadsheetParent({ fileId: spreadsheetId, folderId: GDRIVE_EXPORT_FOLDER_ID })
  return { sheetUrl: getSpreadsheetUrl(spreadsheetId), sheetId: spreadsheetId }
}

export const createOSECasesExport = async ({ baseRunId }: { baseRunId: string }) => {
  const title = `OSE EXPORT ${new Date().toISOString().split('.')[0].replace('T', ' ')}`

  const result = await getChildBaseRuns({
    parentBaseRunId: baseRunId,
    childBaseId: CASES_BASE_ID,
  })

  const sheetValues: ISheetValueRow[] = await getSheetRowsForOSEExport(result)

  const { sheetUrl, sheetId } = await createGoogleSheet({
    title,
  })

  await appendRows({
    spreadsheetId: sheetId,
    tabName: 'Sheet1',
    values: [EXPORT_SHEET_FIELDS, ...sheetValues],
  })

  return sheetUrl
}
