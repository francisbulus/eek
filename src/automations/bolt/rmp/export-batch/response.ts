import { EXPORT_SHEET_FIELDS } from '../../../../external/bolt/rmp/constants'
import {
  getChildBaseRuns,
  getSheetRowsForBoltRMPExport,
} from '../../../../external/bolt/rmp/helpers'
import { ISheetValueRow } from '../../../../helpers/arrays'
import {
  appendRows,
  createSpreadsheet,
  getSpreadsheetUrl,
  makePublic,
} from '../../../../helpers/google/sheets'
import { BaseRun } from '../../../../helpers/types'

const createGoogleSheet = async ({ title }: { title: string }) => {
  const spreadsheetId = await createSpreadsheet({ title })

  if (!spreadsheetId) throw new Error(`Couldn't create spreadsheet`)

  await makePublic(spreadsheetId as string)

  return { sheetUrl: getSpreadsheetUrl(spreadsheetId), sheetId: spreadsheetId }
}

export const createBoltRMPExport = async ({
  baseRun,
  restaurantBaseId,
}: {
  baseRun: BaseRun
  restaurantBaseId: string
}) => {
  const title = `BOLT RMP EXPORT ${new Date().toISOString().split('.')[0].replace('T', ' ')}`

  const result = await getChildBaseRuns({
    parentBaseRunId: baseRun.id,
    childBaseId: restaurantBaseId,
  })

  const sheetValues: ISheetValueRow[] = await getSheetRowsForBoltRMPExport(result)

  const { sheetUrl, sheetId } = await createGoogleSheet({
    title,
  })

  await appendRows({
    spreadsheetId: sheetId,
    tabName: 'Sheet1',
    values: [EXPORT_SHEET_FIELDS, ...sheetValues],
    inputOption: 'USER_ENTERED',
  })

  return sheetUrl
}
