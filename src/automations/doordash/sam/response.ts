import {
  addSpreadsheetParent,
  duplicateSpreadsheet,
  getSpreadsheetId,
  getSpreadsheetUrl,
  makePublic,
  renameSpreadsheet,
} from '../../../helpers/google/sheets'

async function createExtractionSheet({ name }: { name: string }) {
  const spreadsheetId = getSpreadsheetId(
    'https://docs.google.com/spreadsheets/d/1ykInaokIhGsnBQY9mCfHxu7mQISXlnKvpuylg5nwGyM/edit#gid=504448206'
  )
  const GDRIVE_FOLDER_ID = '1t1IQ_D8yM3MORl-uve7ZFHqL5taTJvKZ'
  const newSheet = await duplicateSpreadsheet(spreadsheetId)
  const newSheetId = newSheet.id as string
  await renameSpreadsheet({
    spreadsheetId: newSheetId,
    newTitle: `${name}: Ship Anywhere Menu`,
  })
  await makePublic(newSheetId)
  await addSpreadsheetParent({ fileId: newSheetId, folderId: GDRIVE_FOLDER_ID })
  return getSpreadsheetUrl(newSheetId)
}

export { createExtractionSheet }
