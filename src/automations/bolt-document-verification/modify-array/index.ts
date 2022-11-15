import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const inputYupSchema = yup
  .object({
    input_data: yup.array().of(yup.object()).required(),
    spreadsheet_url: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    output: yup.array().of(yup.object()).required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = inputData.input_data.map((item: any) => ({
        ...item,
        spreadsheetUrl: inputData.spreadsheet_url,
      }))

      const outputData = outputYupSchema.cast({ output })

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
