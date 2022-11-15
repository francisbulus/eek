import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { removeHeaderRow, unzipArrayOfObjects } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { appendRows, getSpreadsheetId } from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    tabName: yup.string().required(),
    range: yup.string().nullable().notRequired(),
    values: yup.array().of(yup.object().required()).required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const values = removeHeaderRow(unzipArrayOfObjects(inputData.values))

      await appendRows({
        range: inputData.range ?? undefined,
        spreadsheetId: getSpreadsheetId(inputData.googleSheetUrl),
        tabName: inputData.tabName,
        values,
      })

      const outputData = {}

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
