import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { getCompetitorsToBeScrapped, scrapeCompetitors } from './response'

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const stepRun = await ultron.stepRun.findById(stepRunId as string)

      if (!stepRun)
        throw new BusinessInstanceNotFound({
          name: 'No step run found',
          by: 'if (!stepRun)',
          source: 'bolt/rmp/scraping-automation',
        })

      const baseRun = await ultron.baseRun.findById(stepRun.baseRunId)

      if (!baseRun)
        throw new BusinessInstanceNotFound({
          name: 'No base run found',
          by: 'if (!baseRun)',
          source: 'bolt/rmp/scraping-automation',
        })

      const competitors = await getCompetitorsToBeScrapped({ baseRun })

      if (Object.keys(competitors).length === 0)
        return res.send({ stepRunId, token, data: {}, status: STEP_RUN_STATUSES.DONE })

      await scrapeCompetitors({ competitors, baseRun })

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
