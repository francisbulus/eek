import { VercelRequest, VercelResponse } from '@vercel/node'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError, initErrorCatcher } from '../../helpers/errors'
import { resendFailed } from './helpers/seated'

initErrorCatcher()

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    const runIds = await resendFailed()

    res.send({
      data: { runIds },
      status: STEP_RUN_STATUSES.DONE,
    })
  } catch (err: any) {
    handleError({ err, req, res })
  }
}
