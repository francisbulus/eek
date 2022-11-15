import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { handleError } from 'src/helpers/errors'

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      res.send({
        stepRunId: '',
        data: {},
        status,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
