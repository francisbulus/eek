import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { fetchSFDCData } from './response'

const outputYupSchema = yup
  .object({
    data: yup
      .array()
      .of(
        yup.object({
          caseNumber: yup.string().required().nullable(),
          customerID: yup.string().required().nullable(),
          subject: yup.string().required().nullable(),
          description: yup.string().required().nullable(),
          parentCaseNumber: yup.string().required().nullable(),
          caseUrl: yup.string().required().nullable(),
          packageStatus: yup.string().required().nullable(),
          menuUrls: yup.string().required().nullable(),
          gfrLink: yup.string().required().nullable(),
          vendor: yup.string().required().nullable(),
          murType: yup.string().required().nullable(),
        })
      )
      .nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      logger.info(`Grubhub MUR - Start`)
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const outputData = outputYupSchema.cast({ data: await fetchSFDCData() })

      logger.info(`Grubhub MUR - End`)
      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      logger.error(`Grubhub MUR - Error`, err)
      handleError({ err, req, res })
    }
  })
}
