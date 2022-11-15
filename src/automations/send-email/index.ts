import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import axios from 'axios'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const { LAMBDA_URL, AUTOMATIONS_TOKEN } = process.env

const NO_REPLY_ASSISTANT = {
  name: 'Invisible Technologies',
  email: 'noreply@inv.tech',
}

const inputYupSchema = yup
  .object({
    destination: yup.string().required(),
    subject: yup.string().required(),
    body: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    result: yup.string().required(),
  })
  .required()

const sendEmail = async ({
  destination,
  subject,
  body,
}: {
  destination: string
  subject: string
  body: string
}) => {
  await axios.post(
    `${LAMBDA_URL}/api/malone/send-email`,
    {
      to: [{ name: destination, email: destination }],
      assistant: NO_REPLY_ASSISTANT,
      subject,
      body,
    },
    {
      headers: {
        Authorization: `Basic ${AUTOMATIONS_TOKEN}`,
      },
    }
  )

  return { result: 'Sent!' }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      // if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await sendEmail(inputData)

      const outputData = outputYupSchema.cast(output)

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
