import { NowRequest, NowResponse } from '@vercel/node'

import { handleError, initErrorCatcher } from '../../../helpers/errors'
import { refreshApiKey } from './helpers/apiKey'
import { randomResyBusinesses } from './helpers/randomBusinesses'

initErrorCatcher()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const business = (await randomResyBusinesses())[0]
    const apiKey = await refreshApiKey(business)
    res.send({ apiKey })
  } catch (err: any) {
    handleError({ err, req, res })
  }
}
