import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { createPICasesExport } from './response'

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
      const stepRun = await ultron.stepRun.findById(stepRunId as string)

      if (!stepRun)
        throw new BusinessInstanceNotFound(
          { name: 'stepRun', by: 'id', source: 'pi/export-batch' },
          { stepRunId }
        )

      const baseRun = await ultron.baseRun.findById(stepRun.baseRunId)

      const output = await createPICasesExport({
        baseRun,
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
