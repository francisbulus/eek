import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { importSheet } from './response'

const inputYupSchema = yup
  .object({
    sheetUrl: yup.string().required(),
    sheetTab: yup.string().required(),
    sla: yup.number().optional(),
    description: yup.string().optional(),
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
      const stepRun = await ultron.stepRun.findById(stepRunId as string)
      const inputData = inputYupSchema.validateSync(req.body.data)
      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const output = { data: await importSheet({ ...inputData, batchId: stepRun.baseRunId }) }

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
