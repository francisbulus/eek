import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { createOSECasesExport } from './response'

const inputYupSchema = yup.object({ batchID: yup.string().required() }).required()

const outputYupSchema = yup
  .object({
    exportLink: yup.string(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const { batchID } = inputYupSchema.validateSync(req.body.data)

      const stepRun = await ultron.stepRun.findById(stepRunId as string)

      if (!stepRun)
        throw new BusinessInstanceNotFound(
          { name: 'stepRun', by: 'id', source: 'ose/export-batch' },
          { stepRunId }
        )

      const output = await createOSECasesExport({
        baseRunId: batchID,
      })

      const outputData = outputYupSchema.cast({ exportLink: output })

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
