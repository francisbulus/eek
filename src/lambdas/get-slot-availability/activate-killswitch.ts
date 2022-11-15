import { VercelRequest, VercelResponse } from '@vercel/node'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError, initErrorCatcher } from '../../helpers/errors'
import { setKillSwitch } from './helpers/killSwitch'

initErrorCatcher()

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    const ret = await setKillSwitch(true)

    res.send({
      data: ret,
      status: STEP_RUN_STATUSES.DONE,
    })
  } catch (err: any) {
    handleError({ err, req, res })
  }
}
