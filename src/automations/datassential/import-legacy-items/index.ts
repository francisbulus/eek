import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { LEGACY_IMPORT_RESULT_PAYLOAD_BASE_VAR_ID } from '../../../external/datassential'
import { ultron } from '../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { getRestaurantLegacyItems } from './response'

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

      const { restCode } = inputYupSchema.validateSync(req.body.data)
      const stepRun = await ultron.stepRun.findById(stepRunId as string)

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const currentRestaurant = await ultron.baseRun.findById(stepRun.baseRunId)

      if (!currentRestaurant)
        throw new BusinessInstanceNotFound(
          { name: 'baseRun', by: 'id' },
          { baseRunId: stepRun.baseRunId }
        )

      const result = await getRestaurantLegacyItems({ restCode })

      await ultron.baseRun.updateVariableValue({
        baseRunId: stepRun.baseRunId,
        baseVariableId: LEGACY_IMPORT_RESULT_PAYLOAD_BASE_VAR_ID,
        value: result.data,
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
