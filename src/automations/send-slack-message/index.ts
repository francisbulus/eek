import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { sendMessage } from '../../external/slack'
import { handleError, ValidationError } from '../../helpers/errors'
import { fullRenderSlackMessage } from '../../helpers/mustache/slack'
import { validateBasics } from '../../helpers/yup'

// Modify these to match the definitions in ./handler
const inputYupSchema = yup
  .object({
    channel: yup.string().required(),
    message: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    formattedMessage: yup.string(),
  })
  .required()

const sendMsg = async ({
  stepRunId,
  channel,
  message,
}: {
  stepRunId: number
  channel: string
  message: string
}) => {
  const text = await fullRenderSlackMessage({ stepRunId, templateString: message })
  await sendMessage({ channel, text })
  return {
    formattedMessage: text,
  }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      if (typeof stepRunId === 'string')
        throw new ValidationError('Send Slack Message is only implemented for the DAL')

      const output = await sendMsg({
        channel: inputData.channel,
        message: inputData.message,
        stepRunId,
      })
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
