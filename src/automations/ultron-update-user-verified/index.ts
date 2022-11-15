import { hasRole } from '@invisible/heimdall'
// eslint-disable-next-line import/no-unresolved
import { NowRequest, NowResponse } from '@vercel/node'
import { Client } from 'pg'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const { ULTRON_DB_URL } = process.env

const inputYupSchema = yup
  .object({
    email: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    result: yup.string().required(),
  })
  .required()

const updateUser = async ({ email }: { email: string }) => {
  const client = new Client({
    connectionString: ULTRON_DB_URL,
    ssl: { rejectUnauthorized: false },
  })

  client.connect()

  await client.query(`UPDATE ultron.users SET identity_verified=true WHERE email='${email}';`)

  return { result: 'Updated!' }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      // if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await updateUser(inputData)

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
