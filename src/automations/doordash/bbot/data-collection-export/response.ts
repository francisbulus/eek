import { values } from 'lodash/fp'

import {
  GDRIVE_EXPORT_FOLDER_ID,
  STORES_BASE_ID,
  UUIDs,
} from '../../../../external/doordash/bbot/constants'
import { ultron } from '../../../../external/ultron'
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
  stepRunbaseRunId,
}: {
  batchId: string
  stepRunbaseRunId: string
}): Promise<string> => {
  const allBatchOutreach = await ultron.baseRun.findMany({
    where: {
      parent: {
        parent: {
          id: stepRunbaseRunId,
        },
      },
    },
    includeBaseVariableIds: values(UUIDs.Outreach),
  })
  const storeOutreachMap = allBatchOutreach.reduce(
    (acc: Record<string, Record<string, any>[]>, o) => ({
      ...acc,
      [o.parentId as string]: [
        ...(acc[o.parentId as string] ? [...acc[o.parentId as string]] : []),
        o.baseRunVariables.reduce((vacc, v) => ({ ...vacc, [v.baseVariableId]: v.value }), {}),
      ],
    }),
    {}
  )

  const stores = await ultron.baseRun.findChildBaseRuns({
    parentBaseRunId: stepRunbaseRunId,
    baseId: STORES_BASE_ID,
  })
  const data = stores.map((store, index) => {
    const getValue = (baseVariableId: string, variables: any[]) =>
      variables.find((v) => v.baseVariable.id === baseVariableId)?.value
    const outreach = storeOutreachMap[store.id]
    const lastIndex = outreach?.length - 1
    return {
      BUSINESS_NAME: getValue(UUIDs.Stores['Business Name'], store.baseRunVariables),
      'MAX(A.FORMATTED_ADDRESS)': getValue(UUIDs.Stores['Address'], store.baseRunVariables),
      'MAX(S.PHONE_NUMBER)': getValue(UUIDs.Stores['Phone Number'], store.baseRunVariables),
      ACCOUNT_OWNER: getValue(UUIDs.Stores['Account Owner'], store.baseRunVariables),
      STORE_COUNT: getValue(UUIDs.Stores['Store Count'], store.baseRunVariables),
      Agents: outreach?.[lastIndex]?.[UUIDs.Outreach['Operator Name']] ?? '',
      'Operate Complete': outreach?.[lastIndex]?.[UUIDs.Outreach['Operated Time']] ? 'Done' : '',
      'Operate Date': outreach?.[lastIndex]?.[UUIDs.Outreach['Operated Time']] ?? '',
      'Loyalty Provider?': outreach?.[lastIndex]?.[UUIDs.Outreach['Loyalty Program Flag']] ?? '',
      'Name of Loyalty Provider (if yes)':
        outreach?.[lastIndex]?.[UUIDs.Outreach['Loyalty Provider']] ?? '',
      'Gift Card Provider?': outreach?.[lastIndex]?.[UUIDs.Outreach['Gift Card Flag']] ?? '',
      'Name of Gift Card Provider (if yes)':
        outreach?.[lastIndex]?.[UUIDs.Outreach['Gift Card Provider']] ?? '',
      'Name of POS provider': outreach?.[lastIndex]?.[UUIDs.Outreach['Pos Provider']] ?? '',
      'Needs Outreach': outreach?.[lastIndex]?.[UUIDs.Outreach['Unsuccessful Reason']]
        ? 'Yes'
        : 'No',
      'Call Completed': outreach?.[lastIndex]?.[UUIDs.Outreach['Connected']] ?? '',
      Auditor: outreach?.[lastIndex]?.[UUIDs.Outreach['Auditor Name']] ?? '',
      'Audit Complete': outreach?.[lastIndex]?.[UUIDs.Outreach['Audit Time']] ? 'Done' : '',
      'Audit Date': outreach?.[lastIndex]?.[UUIDs.Outreach['Audit Time']] ?? '',
    }
  })

  const date = formatInTimeZone({ date: new Date(Date.now()), tz: 'UTC' })
  const { sheetUrl, sheetId } = await createGoogleSheet({
    title: `${batchId} | ${date}`,
    folderId: GDRIVE_EXPORT_FOLDER_ID,
  })

  const sheetTab = 'Sheet1'
  await appendRows({
    spreadsheetId: sheetId,
    tabName: sheetTab,
    values: unzipArrayOfObjects(data),
  })

  return sheetUrl
}
