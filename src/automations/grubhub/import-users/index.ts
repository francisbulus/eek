import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { BusinessLogicError, handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { validateGrubhubUsers } from './response'

const inputYupSchema = yup
  .object({
    arrayOfUsers: yup.array().of(
      yup.object({
        Name: yup.string().required(),
        Email: yup.string().required(),
      })
    ),
  })
  .strict()

const outputYupSchema = yup
  .object({
    validUsersArray: yup.array().of(
      yup
        .object({
          Name: yup.string().required(),
          Email: yup.string().required(),
        })
        .nullable()
    ),
  })
  .strict()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const { arrayOfUsers } = inputYupSchema.validateSync(req.body.data)

      if (!arrayOfUsers || arrayOfUsers.length === 0)
        throw new BusinessLogicError('No array of users provided')

      const validUsersArray = await validateGrubhubUsers({ arrayOfUsers })

      const outputData = outputYupSchema.cast({ validUsersArray })

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
