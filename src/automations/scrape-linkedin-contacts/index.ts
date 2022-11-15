import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { bragi } from '../../external/bragi'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    credentialsId: yup.number().required(),
    urls: yup.array().of(yup.string()).required(),
  })
  .required()

// Dependency injection for testing
export default async (req: NowRequest, res: NowResponse, service?: typeof bragi): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      service = service && service.createJob ? service : bragi

      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      try {
        const status = await service.createJob({
          stepRunId,
          token,
          urls: inputData.urls,
          credentialsId: inputData.credentialsId,
        })
        res.send({
          stepRunId,
          token,
          data: {},
          status: status === 200 ? STEP_RUN_STATUSES.RUNNING : STEP_RUN_STATUSES.FAILED,
        })
      } catch (error) {
        res.send({
          stepRunId,
          token,
          data: {},
          status: STEP_RUN_STATUSES.FAILED,
          errorMessage: JSON.stringify(error),
        })
      }
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
