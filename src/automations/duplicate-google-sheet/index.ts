import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import {
  duplicateSpreadsheet,
  getSpreadsheetId,
  getSpreadsheetUrl,
} from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    newGoogleSheetUrl: yup.string().required(),
  })
  .required()

const duplicate = async ({ googleSheetUrl }: { googleSheetUrl: string }) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const newSheet = await duplicateSpreadsheet(spreadsheetId)

  return getSpreadsheetUrl(newSheet.id!)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { newGoogleSheetUrl: await duplicate(inputData) }

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
