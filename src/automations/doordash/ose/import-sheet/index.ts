import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { importSheet } from './response'

const inputYupSchema = yup
  .object({
    sheetUrl: yup.string().required(),
    sheetTab: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    data: yup.array().of(yup.object()).nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { data: await importSheet(inputData) }

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
