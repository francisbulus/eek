import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import axios from 'axios'
import { isEmpty } from 'lodash/fp'

import { HOTPADS_SCRAPERS_URL } from '../../config/env'
import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId } = validateBasics(req)

      const url = `${HOTPADS_SCRAPERS_URL}/hotpads?stepRunId=${stepRunId}`
      logger.debug(`hotpads scraper`, { url })

      const result = await axios.get(url)
      logger.debug(`hotpads scraper`, result)
      const status = !isEmpty(result?.data?.error)
        ? STEP_RUN_STATUSES.FAILED
        : STEP_RUN_STATUSES.RUNNING

      res.send({
        stepRunId,
        data: {},
        status,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
