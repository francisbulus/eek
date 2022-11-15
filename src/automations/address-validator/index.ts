import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { validateAddresses } from '../../external/address-validator'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup
      .array()
      .of(yup.object({ 'Unvalidated Address': yup.string().required() }))
      .required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup
      .array()
      .of(
        yup.object({
          'Unvalidated Address': yup.string().required(),
          Status: yup.string().required(),
          'Formatted Address': yup.string().required(),
        })
      )
      .required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: await validateAddresses(inputData) }

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
