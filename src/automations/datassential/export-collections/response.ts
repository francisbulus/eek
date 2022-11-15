import { keys, map } from 'lodash/fp'

import {
  CURRENT_ITEM_BASE_ID,
  LEGACY_ITEM_BASE_ID,
  UUIDs,
} from '../../../external/datassential/constants'
import { formatItems, orderBaseVariables } from '../../../external/datassential/helpers'
import { ultron } from '../../../external/ultron'
import { unzipArrayOfObjects } from '../../../helpers/arrays'
import { BusinessInstanceNotFound } from '../../../helpers/errors'
import {
  addSpreadsheetParent,
  appendRows,
  createGoogleSheetTab,
  createSpreadsheet,
  getSpreadsheetUrl,
} from '../../../helpers/google/sheets'
import { formatInTimeZone } from '../../../lambdas/get-slot-availability/helpers/date'

const createGoogleSheet = async ({ title, folderId }: { title: string; folderId?: string }) => {
  const spreadsheetId = await createSpreadsheet({ title })
  if (!spreadsheetId) throw new Error(`Couldn't create spreadsheet`)
  if (folderId) await addSpreadsheetParent({ fileId: spreadsheetId, folderId })
  return { sheetUrl: getSpreadsheetUrl(spreadsheetId), sheetId: spreadsheetId }
}

export const createColectionExport = async ({
  baseRunId,
  name,
  sourceUrl,
  menuScreenshotUrls,
  driveFolderKey,
  address,
  restCode,
}: {
  baseRunId: string
  address: string
  name: string
  restCode: string
  sourceUrl: string
  driveFolderKey: string
  menuScreenshotUrls: string
}): Promise<string> => {
  const currentRestaurant = await ultron.baseRun.findById(baseRunId)

  if (!currentRestaurant)
    throw new BusinessInstanceNotFound({ name: 'baseRun', by: 'id' }, { baseRunId })

  const currentItemBaseRuns = await ultron.baseRun.findMany({
    where: {
      baseId: CURRENT_ITEM_BASE_ID,
      parentId: currentRestaurant.id,
    },
    includeBaseVariableIds: keys(UUIDs.CurrentItem),
  })
  const legacyItemBaseRuns = await ultron.baseRun.findMany({
    where: {
      baseId: LEGACY_ITEM_BASE_ID,
      parentId: currentRestaurant.id,
    },
    includeBaseVariableIds: keys(UUIDs.LegacyItem),
  })

  const date = formatInTimeZone({ date: new Date(Date.now()), tz: 'UTC' })
  const { sheetUrl, sheetId } = await createGoogleSheet({
    title: `${name} - ${date}`,
    folderId: driveFolderKey,
  })

  await appendRows({
    spreadsheetId: sheetId,
    tabName: 'Sheet1',
    values: [
      ['Restaurant Code', 'Restaurant Name', 'Source', 'Screenshot URLs', 'Address'],
      [restCode, name, sourceUrl, menuScreenshotUrls, address],
    ],
  })

  const legacySheetTab = 'Legacy Items'
  await createGoogleSheetTab({ title: legacySheetTab, spreadsheetId: sheetId })
  const orderedLegacyItems = orderBaseVariables(legacyItemBaseRuns, keys(UUIDs.LegacyItem))
  await appendRows({
    spreadsheetId: sheetId,
    tabName: legacySheetTab,
    values: unzipArrayOfObjects(
      map(
        (item) => ({ ...item, 'Screenshot URLs': menuScreenshotUrls }),
        formatItems(orderedLegacyItems, UUIDs.LegacyItem)
      )
    ),
  })

  const currentSheetTab = 'Current Items'
  await createGoogleSheetTab({ title: currentSheetTab, spreadsheetId: sheetId })
  const orderedCurrentItems = orderBaseVariables(currentItemBaseRuns, keys(UUIDs.CurrentItem))
  await appendRows({
    spreadsheetId: sheetId,
    tabName: currentSheetTab,
    values: unzipArrayOfObjects(
      map(
        (item) => ({ ...item, 'Screenshot URLs': menuScreenshotUrls }),
        formatItems(orderedCurrentItems, UUIDs.CurrentItem)
      )
    ),
  })
  return sheetUrl
}
