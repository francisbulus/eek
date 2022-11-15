import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { ultron } from '../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { createColectionExport } from './response'

const inputYupSchema = yup
  .object({
    driveFolderKey: yup.string().required(),
    sourceUrl: yup.string().required(),
    name: yup.string().required(),
    address: yup.string().required(),
    menuScreenshotUrls: yup.string().required(),
    restCode: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    exportLink: yup.string().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.findById(stepRunId as string)
      const validData = inputYupSchema.validateSync(req.body.data)
      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const sheetUrl = await createColectionExport({
        baseRunId: stepRun.baseRunId,
        ...validData,
      })
      const outputData = outputYupSchema.cast({ exportLink: sheetUrl })
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
