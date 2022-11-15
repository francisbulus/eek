import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const inputYupSchema = yup
  .object({
    input_data: yup.array().of(yup.object()).required(),
    market: yup.string().required(),
    pick_list: yup
      .array()
      .of(
        yup.object({
          Providers: yup.string().required(),
        })
      )
      .required(),
    final_deliverable_sheet: yup.string().required(),
    type: yup.string(),
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
        Market: inputData.market,
        PickList: inputData.pick_list.map((it: { Providers: string }) => it.Providers),
        FinalDeliverableSheet: inputData.final_deliverable_sheet,
        Type: inputData.type,
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
