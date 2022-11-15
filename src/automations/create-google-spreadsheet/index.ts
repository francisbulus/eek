import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import {
  addSpreadsheetParent,
  createSpreadsheet,
  getSpreadsheetUrl,
} from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    title: yup.string().required(),
    folderId: yup.string().nullable().notRequired(),
  })
  .required()

const outputYupSchema = yup
  .object({
    newGoogleSheetUrl: yup.string().required(),
  })
  .required()

const createGoogleDocument = async ({ title, folderId }: { title: string; folderId?: string }) => {
  const spreadsheetId = await createSpreadsheet({ title })
  if (!spreadsheetId) throw new Error(`Couldn't create spreadsheet`)
  if (folderId) await addSpreadsheetParent({ fileId: spreadsheetId, folderId })
  return getSpreadsheetUrl(spreadsheetId)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = {
        newGoogleSheetUrl: await createGoogleDocument({
          ...inputData,
          folderId: inputData.folderId ?? undefined,
        }),
      }

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

export { createGoogleDocument }
