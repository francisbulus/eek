import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'

const inputYupSchema = yup
  .object({
    value: yup.string().nullable(),
    initialValue: yup.string().nullable(),
  })
  .required()

const outputYupSchema = yup
  .object({
    data: yup.string().nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const { value, initialValue } = inputYupSchema.validateSync(req.body.data)

      let log = ''

      if (initialValue) {
        log = initialValue
      }

      log = log ? `${log},` : log
      const output = { data: `${log}${value ? value : '-'}` }
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
