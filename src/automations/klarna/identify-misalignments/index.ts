import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const inputYupSchema = yup
  .object({
    productDisplayPage1: yup.array().of(yup.string()).required(),
    checkout1: yup.array().of(yup.string()).required(),
    productDisplayPage2: yup.array().of(yup.string()).required(),
    checkout2: yup.array().of(yup.string()).required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    productDisplayPageMatches: yup.array().of(yup.bool().required()).required(),
    checkoutMatches: yup.array().of(yup.bool().required()).required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const productDisplayPageMatches = inputData.productDisplayPage1.map(
        (pdp1: string, i: number) => inputData.productDisplayPage2[i] === pdp1
      )
      const checkoutMatches = inputData.checkout1.map(
        (checkout1: string, i: number) => inputData.checkout2[i] === checkout1
      )

      const outputData = outputYupSchema.cast({ productDisplayPageMatches, checkoutMatches })

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
