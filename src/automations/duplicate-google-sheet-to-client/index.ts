import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import moment from 'moment-timezone'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import {
  addSpreadsheetParent,
  duplicateSpreadsheet,
  getSpreadsheetId,
  getSpreadsheetUrl,
  renameSpreadsheet,
} from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    clientName: yup.string().required(),
    taskDescription: yup.string().required(),
    destinationFolderUrl: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    newGoogleSheetUrl: yup.string().required(),
  })
  .required()

const addCopyToClientFolder = async ({
  googleSheetUrl,
  clientName,
  taskDescription,
  destinationFolderUrl,
}: {
  googleSheetUrl: string
  clientName: string
  taskDescription: string
  destinationFolderUrl: string
}) => {
  const existingSpreadsheetId = getSpreadsheetId(googleSheetUrl)
  const newSpreadsheet = await duplicateSpreadsheet(existingSpreadsheetId)
  if (!newSpreadsheet || !newSpreadsheet.id) return

  const now = moment().utc().format('YYYY/MM/DD')
  const newTitle = `${clientName}: ${taskDescription} -- ${now}`
  await renameSpreadsheet({
    spreadsheetId: newSpreadsheet.id!,
    newTitle,
  })
  await addSpreadsheetParent({
    fileId: newSpreadsheet.id,
    folderId: destinationFolderUrl,
  })

  return getSpreadsheetUrl(newSpreadsheet.id!)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { newGoogleSheetUrl: await addCopyToClientFolder(inputData) }

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
