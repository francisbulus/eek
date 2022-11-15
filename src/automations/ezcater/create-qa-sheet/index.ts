import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import {
  duplicateSpreadsheet,
  getSpreadsheetId,
  getSpreadsheetUrl,
  makePublic,
  renameSpreadsheet,
} from '../../../helpers/google/sheets'
import { validateBasics } from '../../../helpers/yup'

const inputYupSchema = yup
  .object({
    restaurantName: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    qaSheetURL: yup.string().required(),
  })
  .required()

const createGoogleSheetFromTemplate = async (
  templateSheetUrl: string,
  googleSheetTitle: string
) => {
  const spreadsheetId = getSpreadsheetId(templateSheetUrl)
  const newSheet = await duplicateSpreadsheet(spreadsheetId)
  await renameSpreadsheet({
    spreadsheetId: newSheet.id!,
    newTitle: googleSheetTitle,
  })
  await makePublic(newSheet.id as string)
  return getSpreadsheetUrl(newSheet.id as string)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const { restaurantName } = inputYupSchema.validateSync(req.body.data)

      const sheetTitle = `EZ QA - ${restaurantName} ${new Date()
        .toISOString()
        .split('.')[0]
        .replace('T', ' ')}`

      const qaSheetURL = await createGoogleSheetFromTemplate(
        'https://docs.google.com/spreadsheets/d/1oXMoOvN0Qq2Ga2udAWUfE5F1lPlamdgev6odiEb5hZE/edit#gid=0',
        sheetTitle
      )

      const outputData = outputYupSchema.cast({ qaSheetURL })

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
