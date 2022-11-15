import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { getChildBaseRunItems } from 'src/external/grubhub/helpers'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { exportToSheets } from './response'

const inputYupSchema = yup
  .object({
    driveFolderKey: yup.string().required(),
    baseId: yup.string().required(),
    keys: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    data: yup.string().required(),
  })
  .required()

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.findById(stepRunId as string)

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const inputData = inputYupSchema.validateSync(req.body.data)

      const childBaseRuns = await getChildBaseRunItems({
        stepBaseRunId: stepRun.baseRunId,
        baseId: inputData.baseId,
      })

      const keys: string[] = inputData.keys.trim().split(',')

      const data: Record<string, any>[] = childBaseRuns.map((baseRun) => {
        const obj: Record<string, any> = {}

        keys.forEach((key) => {
          obj[key] = baseRun[key]
        })
        return obj
      })

      const sheetUrl = await exportToSheets({
        batchId: stepRun.baseRunId,
        driveFolderKey: inputData.driveFolderKey,
        data,
      })

      const outputData = outputYupSchema.cast({ data: sheetUrl })

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
