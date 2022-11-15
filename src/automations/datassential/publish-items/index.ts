import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { ultron } from '../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { publishRestaurantItems } from './response'

const inputYupSchema = yup
  .object({
    restCode: yup.string().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.findById(stepRunId as string)
      const { restCode } = inputYupSchema.validateSync(req.body.data)
      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      await publishRestaurantItems({
        baseRunId: stepRun.baseRunId,
        stepRunId: stepRun.id,
        restCode,
      })
      res.send({
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
