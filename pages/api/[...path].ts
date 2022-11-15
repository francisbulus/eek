import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import axios from 'axios'
import { NextApiHandler } from 'next'
import { z } from 'zod'

import { ALL_HANDLERS } from '../../src/automations'
import { handleError } from '../../src/helpers/errors'

export const config = {
  api: {
    responseLimit: '50mb',
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

const querySchema = z.object({
  path: z.array(z.string()),
})

const isOnK8s = (req: any) => req.url?.includes('inv.systems')

const callVercel = async (req: any, queryPath: string) =>
  axios({
    method: 'POST',
    url: `https://automations.invisible-tech.vercel.app/api/${queryPath}`,
    headers: { authorization: req.headers.authorization as string },
    data: req.body,
  })

const handler: NextApiHandler = (req, res) =>
  hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    const queryPath = querySchema.parse(req.query).path.join('/')
    try {
      if (err) throw err
      logger.info('Automation called', { query: queryPath, body: req.body })
      const automation = Object.keys(ALL_HANDLERS)
        .map((key) => ALL_HANDLERS[key])
        .find((o) => o.path === queryPath)

      if (!automation) {
        logger.warn('Automation not found. Trying vercel', { queryPath })
        const { data } = await axios({
          method: 'POST',
          url: `https://automations.invisible-tech.vercel.app/api/${queryPath}`,
          headers: { authorization: req.headers.authorization as string },
          data: req.body,
        })
        res.send(data)
        return
      }
      await automation.execute(req as any, res as any)
    } catch (err: any) {
      if (isOnK8s(req)) {
        // try vercel if k8s fails
        try {
          logger.warn('Automation failed on k8s, trying vercel')
          const { data } = await callVercel(req, queryPath)
          res.send(data)
        } catch (err: any) {
          logger.error('Automation failed on vercel too')
          handleError({ err, req, res })
        }
      } else {
        handleError({ err, req, res })
      }
    }
  })

export default handler
