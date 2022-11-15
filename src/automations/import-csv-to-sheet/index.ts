import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { readCSVContent } from '../../helpers/csv'
import { handleError } from '../../helpers/errors'
import { getSpreadsheetId, populateSheetWithCSV } from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    csvFileUrl: yup.string().required(),
    tabName: yup.string().required(),
  })
  .required()

const csvToSheet = async ({
  googleSheetUrl,
  csvFileUrl,
  tabName,
}: {
  googleSheetUrl: string
  csvFileUrl: string
  tabName: string
}) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const theData = await readCSVContent(csvFileUrl)
  return await populateSheetWithCSV({ theData, spreadsheetId, tabName })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      await csvToSheet(inputData)

      const outputData = null

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
