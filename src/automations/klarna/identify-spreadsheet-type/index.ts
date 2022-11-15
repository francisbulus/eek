import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

// they migrated from ISO 3-letter to 2-letter codes but let's keep both for now
const SIMPLE_COUNTRIES: string[] = []

const inputYupSchema = yup
  .object({
    country: yup.string().required(),
    simpleSpreadsheetUrl: yup.string().url().required(),
    completeSpreadsheetUrl: yup.string().url().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    spreadsheetTemplateUrl: yup.string().url().required(),
    type: yup.string().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      let spreadsheetTemplateUrl = inputData.completeSpreadsheetUrl
      let type = 'complex'
      if (SIMPLE_COUNTRIES.indexOf(inputData.country) >= 0) {
        spreadsheetTemplateUrl = inputData.simpleSpreadsheetUrl
        type = 'simple'
      }
      const outputData = outputYupSchema.cast({
        spreadsheetTemplateUrl,
        type,
      })

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
