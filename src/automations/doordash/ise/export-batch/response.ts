import {
  EXPORT_SHEET_FIELDS,
  GDRIVE_EXPORT_FOLDER_ID,
  RESTAURANTS_BASE_ID,
} from '../../../../external/doordash/ise/constants'
import {
  getChildBaseRuns,
  getSheetRowsForISEExport,
} from '../../../../external/doordash/ise/helper'
import { ISheetValueRow } from '../../../../helpers/arrays'
import {
  addSpreadsheetParent,
  appendRows,
  createSpreadsheet,
  getSpreadsheetUrl,
} from '../../../../helpers/google/sheets'
import { BaseRun } from '../../../../helpers/types'

const createGoogleSheet = async ({ title }: { title: string }) => {
  const spreadsheetId = await createSpreadsheet({ title })

  if (!spreadsheetId) throw new Error(`Couldn't create spreadsheet`)

  if (GDRIVE_EXPORT_FOLDER_ID)
    await addSpreadsheetParent({ fileId: spreadsheetId, folderId: GDRIVE_EXPORT_FOLDER_ID })
  return { sheetUrl: getSpreadsheetUrl(spreadsheetId), sheetId: spreadsheetId }
}

export const createISECasesExport = async ({ baseRun }: { baseRun: BaseRun }) => {
  const title = `ISE EXPORT ${new Date().toISOString().split('.')[0].replace('T', ' ')}`

  const result = await getChildBaseRuns({
    parentBaseRunId: baseRun.id,
    childBaseId: RESTAURANTS_BASE_ID,
  })

  const sheetValues: ISheetValueRow[] = await getSheetRowsForISEExport(result)

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
