import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { getSpreadsheetId, renameGoogleSheetTab } from '../../helpers/google/sheets'
import { renderTabName } from '../../helpers/mustache'
import { validateBasics } from '../../helpers/yup'

// Modify these to match the definitions in ./handler
const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    newTabTitle: yup.string().required(),
    currentTabTitle: yup.string().required(),
  })
  .required()

const renameTab = async ({
  googleSheetUrl,
  newTabTitle,
  currentTabTitle,
}: {
  googleSheetUrl: string
  newTabTitle: string
  currentTabTitle: string
}) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const newTabName = renderTabName({ tabName: newTabTitle })
  return await renameGoogleSheetTab({
    spreadsheetId,
    newTabName,
    currentTabName: currentTabTitle,
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      await renameTab(inputData)

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
