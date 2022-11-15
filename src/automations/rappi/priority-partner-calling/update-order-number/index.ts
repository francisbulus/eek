import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { getUpdatedNumberOfOrders } from './response'

const inputYupSchema = yup
  .object({
    storeId: yup.string().required(),
    sobOrOutb: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    numberOfOrders: yup.number().nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const { storeId, sobOrOutb } = inputYupSchema.validateSync(req.body.data)

      const result = await getUpdatedNumberOfOrders({ storeId, sobOrOutb })

      const outputData = outputYupSchema.cast({
        numberOfOrders: result,
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
