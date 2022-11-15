import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import axios from 'axios'
import { camelCase } from 'lodash'
import { NextApiHandler } from 'next'

import { handleError } from '../../../src/helpers/errors'
import activateKillswitch from '../../../src/lambdas/get-slot-availability/activate-killswitch'
import deactivateKillswitch from '../../../src/lambdas/get-slot-availability/deactivate-killswitch'
import resendFailedUploads from '../../../src/lambdas/get-slot-availability/resend-failed-uploads'
import runForCohort from '../../../src/lambdas/get-slot-availability/run-for-cohort'

const SEATED_HANDLERS = {
  activateKillswitch,
  deactivateKillswitch,
  runForCohort,
  resendFailedUploads,
} as const

const isOnK8s = (req: any) => req.url?.includes('inv.systems')

const callVercel = async (req: any, queryPath: string) =>
  axios({
    method: 'POST',
    url: `https://automations.invisible-tech.vercel.app/api/${queryPath}`,
    headers: { authorization: req.headers.authorization as string },
    data: req.body,
  })

const handler: NextApiHandler = (req, res) =>
  hasRole(['lambda'])(req, res, async (err: unknown) => {
    if (!req.query.automationName) {
      throw new Error('automationName cannot be empty')
    }
    req.query.automationName =
      typeof req.query.automationName === 'object'
        ? req.query.automationName[0]
        : req.query.automationName

    const queryPath = `get-slot-availability/${req.query.automationName}`

    try {
      if (err) throw err
      logger.info('Automation called', { query: queryPath, body: req.body })

      const automationName = camelCase(req.query.automationName) as keyof typeof SEATED_HANDLERS

      if (!SEATED_HANDLERS[automationName]) {
        // throw new Error(`${automationName} not found in SEATED_HANDLERS`)
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

      const auto = (SEATED_HANDLERS[automationName] as unknown) as NextApiHandler
      await auto(req, res)
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
