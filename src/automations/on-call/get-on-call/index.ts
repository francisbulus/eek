import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { addDays, addHours, startOfWeek } from 'date-fns'
import { identity, pickBy } from 'lodash/fp'
import { z } from 'zod'

import { STEP_RUN_STATUSES } from '../../../constants'
import { userService } from '../../../external/user-service'
import { handleError } from '../../../helpers/errors'
import opsgenie from '../../../helpers/opsgenie'
import { User } from '../../../helpers/types'
import { validateBasics } from '../../../helpers/yup'

const inputSchema = z.object({ scheduleId: z.string() })
type TInput = z.infer<typeof inputSchema>
const outputSchema = z.object({ onCallUserId: z.string(), start: z.date(), end: z.date() })

const getOnCall = async ({ scheduleId }: Pick<TInput, 'scheduleId'>): Promise<{ user: User }> => {
  const email = await opsgenie.getOnCall({ scheduleId })
  if (!email) throw new Error('No On-Call found')
  const user = await userService.findByEmail(email)
  return { user }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> =>
  hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      const { scheduleId } = inputSchema.parse(pickBy(identity, req.body.data))

      const { user } = await getOnCall({ scheduleId })

      const start = addHours(startOfWeek(new Date()), 10) // 10am on Monday (Server time US West)
      const end = addDays(start, 7)
      const outputData = outputSchema.parse({ onCallUserId: user.id, start, end })
      res.send({
        stepRunId,
        token,
        status: STEP_RUN_STATUSES.DONE,
        data: outputData,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
