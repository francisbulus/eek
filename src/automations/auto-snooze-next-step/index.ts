import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { addHours } from 'date-fns'
import pSleep from 'p-sleep'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ultron } from '../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    snoozeHours: yup.number().nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.find({
        id: stepRunId,
      })

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const { snoozeHours } = inputYupSchema.validateSync(req.body.data)
      const snoozeUntil = addHours(new Date(), snoozeHours ?? 24) // default: 24 hours

      const WAIT_TIME = 10000 // 10 Seconds
      await pSleep(WAIT_TIME)

      const latestStepRun = await ultron.stepRun.find({
        baseRunId: stepRun.baseRunId,
        status: 'pending',
        order: { createdAt: 'desc' } as { createdAt: string },
      })
      if (latestStepRun.id !== stepRunId) {
        await ultron.stepRun.snooze({ stepRunId: latestStepRun.id, snoozeUntil })
      }

      res.send({
        stepRunId,
        token,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
