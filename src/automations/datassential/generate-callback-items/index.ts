import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'

import { STEP_RUN_STATUSES } from '../../../constants'
import { CURRENT_ITEMS_BASE_ID, LEGACY_ITEMS_BASE_ID } from '../../../external/datassential'
import { ultron } from '../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { generateCallbackItems } from './response'

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const stepRun = await ultron.stepRun.findById(stepRunId as string)

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const currentRestaurant = await ultron.baseRun.findById(stepRun.baseRunId)

      if (!currentRestaurant)
        throw new BusinessInstanceNotFound(
          { name: 'baseRun', by: 'id' },
          { baseRunId: stepRun.baseRunId }
        )

      await generateCallbackItems({
        parentBaseId: currentRestaurant.id,
        currentItemsBaseId: CURRENT_ITEMS_BASE_ID,
        legacyItemsBaseId: LEGACY_ITEMS_BASE_ID,
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
