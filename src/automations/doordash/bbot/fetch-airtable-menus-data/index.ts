import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { establishAirtableConnection, getAirtableBase } from '../../../../config/airtable'
import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import {
  duplicateSpreadsheet,
  getSpreadsheetId,
  getSpreadsheetUrl,
  makePublic,
  renameSpreadsheet,
} from '../../../../helpers/google/sheets'
import { validateBasics } from '../../../../helpers/yup'

const createGoogleSheet = async (googleSheetUrl: string, googleSheetTitle: string) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const newSheet = await duplicateSpreadsheet(spreadsheetId)
  await renameSpreadsheet({
    spreadsheetId: newSheet.id!,
    newTitle: googleSheetTitle,
  })
  await makePublic(newSheet.id as string)
  return getSpreadsheetUrl(newSheet.id as string)
}

const outputYupSchema = yup
  .object({
    data: yup.array().of(yup.object({})),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      await establishAirtableConnection('doordash')

      const airtableMenusBase = getAirtableBase('appJiDaLmWBJBfsPo') // Menus AT Base ID

      const menusData = (
        await airtableMenusBase('Menu Requests')
          .select({ filterByFormula: "{Menu Status} = 'Not Started'" })
          .firstPage()
      ).map((record: Record<string, any>) => ({
        ...record.fields,
      }))

      for (const record of menusData) {
        const googleSheetTitle = record['Menu Request ID']
        const templateSheetUrl =
          'https://docs.google.com/spreadsheets/d/1MAxQ_VzQQt9_aGFOOwyxfNy8lxEEmRejqWiOmpgHqTo/edit#gid=1425873331'
        record['QA Sheet URL'] = await createGoogleSheet(templateSheetUrl, googleSheetTitle)
        record['Responsible Party (Vendor)'] = record['Responsible Party (Vendor)']
          ? record['Responsible Party (Vendor)']
              ?.map((field: { id: string; email: string; name: string }) => field.name)
              .join(', ')
          : ''
        record['created by'] = record['created by'] ? `${record['created by'].name}` : ''
        record['Menu Files/Attachments'] = record['Menu Files/Attachments']
          ? record['Menu Files/Attachments']?.map((field: { url: string }) => field.url).join(', ')
          : ''
        record['Completed CSV Menus'] = record['Completed CSV Menus']
          ? record['Completed CSV Menus']?.map((field: { url: string }) => field.url).join(', ')
          : ''
        record['CSV Output Only'] = record['CSV Output Only'] === true ? 'Yes' : 'No'
      }

      const output = { data: menusData }

      const outputData = outputYupSchema.cast(output)

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
