import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { UUIDs } from '../../../../external/grubhub/constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { importSheet } from './response'

const inputYupSchema = yup
  .object({
    sheetUrl: yup.string().required(),
    baseId: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    data: yup.array().of(yup.object()).nullable(),
    autoAssignData: yup.array().of(yup.object()).nullable(),
    importErrors: yup.string().notRequired(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      logger.info(`Grubhub FR - Import Sheet Start`)
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const { result, autoCompleteResult, errors } = await importSheet({
        sheetUrl: inputData.sheetUrl,
        frBaseId: inputData.baseId,
        frCompleteBaseId: UUIDs.Bases.FRComplete,
      })

      const outputData = outputYupSchema.cast({
        data: result,
        autoAssignData: autoCompleteResult,
        importErrors: errors,
      })
      logger.info(`Grubhub FR - Import Sheet Stop`)

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      logger.error(`Grubhub FR - Error`, err)
      handleError({ err, req, res })
    }
  })
}
