import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import {
  enableFilters,
  formatHeader,
  formatTabs,
  formatTextAndWrap,
  getSpreadsheetId,
} from '../../helpers/google/sheets'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    tabName: yup.string().required(),
  })
  .required()

const formatGoogleSheet = async ({
  googleSheetUrl,
  tabName,
}: {
  googleSheetUrl: string
  tabName: string
}) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  await formatHeader({ spreadsheetId, tabName })
  await formatTextAndWrap({ spreadsheetId, tabName })
  await enableFilters({ spreadsheetId, tabName })
  await formatTabs({ spreadsheetId })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      await formatGoogleSheet(inputData)

      res.send({
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
