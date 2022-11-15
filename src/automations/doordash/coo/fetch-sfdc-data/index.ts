import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { fetchSFDCData } from './response'

const inputYupSchema = yup
  .object({
    opportunityId: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    opportunityName: yup.string().required().nullable(),
    opportunityURL: yup.string().required().nullable(),
    opportunityStage: yup.string().required().nullable(),
    accountName: yup.string().required().nullable(),
    accountURL: yup.string().required().nullable(),
    msid: yup.string().required().nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await fetchSFDCData({ opportunityId: inputData.opportunityId })

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
