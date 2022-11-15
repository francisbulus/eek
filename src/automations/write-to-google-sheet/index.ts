import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { toLower, trim } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ISheetValue, ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { getSpreadsheetId, writeToSheet } from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    tabName: yup.string().required(),
    range: yup.string().nullable().notRequired(),
    values: yup.array().required(),
    includeHeaderRow: yup.boolean().notRequired().nullable().default(false),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      await writeToSheet({
        tabName: inputData.tabName,
        values: inputData.values as ISheetValue | ITable,
        range: inputData.range ?? undefined,
        spreadsheetId: getSpreadsheetId(inputData.googleSheetUrl!),
        includeHeaderRow:
          typeof inputData.includeHeaderRow === 'string'
            ? trim(toLower(inputData.includeHeaderRow)) === 'true'
            : Boolean(inputData.includeHeaderRow),
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
