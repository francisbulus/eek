import { unzipArrayOfObjects } from '../../../../helpers/arrays'
import {
  addSpreadsheetParent,
  appendRows,
  createSpreadsheet,
  getSpreadsheetUrl,
} from '../../../../helpers/google/sheets'
import { formatInTimeZone } from '../../../../lambdas/get-slot-availability/helpers/date'

const createGoogleSheet = async ({ title, folderId }: { title: string; folderId?: string }) => {
  const spreadsheetId = await createSpreadsheet({ title })
  if (!spreadsheetId) throw new Error(`Couldn't create spreadsheet`)
  if (folderId) await addSpreadsheetParent({ fileId: spreadsheetId, folderId })
  return { sheetUrl: getSpreadsheetUrl(spreadsheetId), sheetId: spreadsheetId }
}

export const exportToSheets = async ({
  batchId,
  data,
  driveFolderKey,
}: {
  batchId: string
  data: Record<string, any>[]

  driveFolderKey: string
}): Promise<string> => {
  const date = formatInTimeZone({ date: new Date(Date.now()), tz: 'UTC' })
  const { sheetUrl, sheetId } = await createGoogleSheet({
    title: `${batchId} | ${date}`,
    folderId: driveFolderKey,
  })

  const sheetTab = 'Sheet1'
  await appendRows({
    spreadsheetId: sheetId,
    tabName: sheetTab,
    values: unzipArrayOfObjects(data),
  })

  return sheetUrl
}
