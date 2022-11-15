import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { autoAssignStep } from '../../../external/grubhub/helpers'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const inputYupSchema = yup
  .object({
    baseVariableId: yup.string().strict(),
  })
  .strict()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const { baseVariableId } = inputYupSchema.validateSync(req.body.data)

      await autoAssignStep({
        stepRunId: stepRunId as string,
        baseVariableId: baseVariableId as string,
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
