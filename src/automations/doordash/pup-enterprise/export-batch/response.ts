import {
  BATCH_EXPORT_ERROR_ID,
  BATCH_EXPORT_LINK_ID,
  CASES_BASE_ID,
  EXPORT_SHEET_FIELDS,
  GDRIVE_EXPORT_FOLDER_ID,
} from '../../../../external/doordash/pup-enterprise/constants'
import {
  getChildBaseRuns,
  getSheetRowsForPUPEnterpriseExport,
  updateBaseRunVariables,
} from '../../../../external/doordash/pup-enterprise/helper'
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

export const createPUPCasesExport = async ({
  batchBaseRunId,
}: {
  batchBaseRunId: string
}): Promise<string> => {
  const title = `PUP Enterprise EXPORT ${new Date().toISOString().split('.')[0].replace('T', ' ')}`
  const { sheetUrl, sheetId } = await createGoogleSheet({
    title,
  })
  const result = await getChildBaseRuns({
    parentBaseRunId: batchBaseRunId,
    childBaseId: CASES_BASE_ID,
  })

  const sheetValues: ISheetValueRow[] = await getSheetRowsForPUPEnterpriseExport(result)

  await appendRows({
    spreadsheetId: sheetId,
    tabName: 'Sheet1',
    values: [EXPORT_SHEET_FIELDS, ...sheetValues],
    inputOption: 'USER_ENTERED',
  })

  await updateBaseRunVariables({
    baseRunId: batchBaseRunId,
    baseVariableId: BATCH_EXPORT_LINK_ID,
    value: sheetUrl,
  })

  await updateBaseRunVariables({
    baseRunId: batchBaseRunId,
    baseVariableId: BATCH_EXPORT_ERROR_ID,
    value: '',
  })

  return sheetUrl
}
