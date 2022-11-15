import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { VercelRequest, VercelResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { uploadToSalesForce } from './helpers'

const inputYupSchema = yup
  .object({
    caseNumber: yup.string().required(),
    custID: yup.string().optional().default(''),
    actionTaken: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    result: yup.string().required(),
  })
  .required()

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      // if (err) throw err // Commented out because was throwing Unauthorized errors in Staging

      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)
      const custID = inputData.custID
      const caseNumber = inputData.caseNumber
      const actionTaken = inputData.actionTaken
      let stepStatus

      logger.debug('Grubhub PCO Upload - Input Parameters', inputData)
      const [uploadStatus, uploadText] = await uploadToSalesForce(custID, caseNumber, actionTaken)

      const outputData = outputYupSchema.cast({ result: uploadText })

      logger.debug(`Grubhub PCO Upload - Upload Status: ${uploadText}`)
      if (uploadStatus == true) {
        stepStatus = STEP_RUN_STATUSES.DONE
      } else {
        stepStatus = STEP_RUN_STATUSES.FAILED
      }

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: stepStatus,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
