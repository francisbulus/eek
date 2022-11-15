import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { saveStepOutcome } from './response'

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      await saveStepOutcome({ stepRunId: stepRunId as string })

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
