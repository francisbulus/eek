import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { isEmpty } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { duplicateTab, getSpreadsheetId } from '../../helpers/google/sheets'
import { isMustacheTemplate, renderTabName } from '../../helpers/mustache'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    tabName: yup.string().required(),
    destinationGoogleSheetUrl: yup.string().notRequired().nullable(),
    newTabName: yup.string().notRequired().nullable(),
  })
  .required()

const outputYupSchema = yup
  .object({
    newTabId: yup.string().required(),
    renderedNewTabName: yup.string().required(),
  })
  .required()

const duplicate = async ({
  googleSheetUrl,
  tabName,
  destinationGoogleSheetUrl,
  newTabName,
}: {
  googleSheetUrl: string
  tabName: string
  destinationGoogleSheetUrl?: string | null
  newTabName?: string | null
}) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const destinationSpreadsheetId = !isEmpty(destinationGoogleSheetUrl)
    ? getSpreadsheetId(destinationGoogleSheetUrl!)
    : spreadsheetId
  const rendered = !isEmpty(newTabName)
    ? isMustacheTemplate(newTabName!)
      ? renderTabName({ tabName: newTabName! })
      : newTabName!
    : undefined

  const newTab = await duplicateTab({
    spreadsheetId,
    tabName,
    destinationSpreadsheetId,
    newTabName: rendered,
  })

  return { newTabId: `${newTab.sheetId}`, renderedNewTabName: newTab.title! }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await duplicate(inputData)

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
