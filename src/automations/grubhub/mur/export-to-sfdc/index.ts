import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { uploadToSalesForce } from './response'

const inputYupSchema = yup
  .object({
    errorsBaseId: yup.string().required(),
    caseNumberId: yup.string().required(),
    parentCaseNumberId: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    uploadStatus: yup.string().required(),
    qualityScore: yup.string().nullable(),
    uploadText: yup.string().nullable(),
  })
  .required()

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.findById(stepRunId as string)
      const baseRun = await ultron.baseRun.findById(stepRun.baseRunId as string)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const response: any = await uploadToSalesForce(
        stepRun.baseRunId,
        inputData.caseNumberId,
        inputData.errorsBaseId,
        inputData.parentCaseNumberId,
        baseRun
      )

      const outputData = outputYupSchema.cast({
        uploadStatus: response.uploadStatus,
        qualityScore: response.qualityScore,
        uploadText: response.uploadText,
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
