import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { setMeetingPassword } from '../../external/zoom'
import { handleError } from '../../helpers/errors'
import { alphaNumericString } from '../../helpers/lodash'
import { validateBasics } from '../../helpers/yup'

// Modify these to match the definitions in ./handler
const inputYupSchema = yup
  .object({
    meeting_id: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    password: yup.string().required().max(16),
  })
  .required()

const resetMeetingPassword = async ({ meetingId }: { meetingId: string }) => {
  const password = alphaNumericString(16)
  const status = await setMeetingPassword({ meetingId, password })
  if (status !== 200) throw new Error('Failed to set password')
  return { password }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await resetMeetingPassword({ meetingId: inputData.meeting_id })
      const outputData = outputYupSchema.cast(output)

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      // You shouldn't need to change this
      handleError({ err, req, res })
    }
  })
}
