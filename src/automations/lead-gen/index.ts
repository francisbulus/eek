import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { getNamesAndRolesForDomains } from '../../external/lead-gen'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    table: yup
      .array()
      .of(
        yup
          .object({
            company_name: yup.string().required(),
            roles: yup.string(),
            domain_name: yup.string(),
            location: yup.string(),
          })
          .required()
      )
      .required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    if (err) throw err
    const { stepRunId, token } = validateBasics(req)
    const inputData = inputYupSchema.validateSync(req.body.data)
    try {
      try {
        const status = await getNamesAndRolesForDomains(stepRunId, token, inputData)
        res.send({
          stepRunId,
          token,
          data: {},
          status: status === 200 ? STEP_RUN_STATUSES.RUNNING : STEP_RUN_STATUSES.FAILED,
        })
      } catch (error) {
        res.send({
          stepRunId,
          token,
          data: {},
          status: STEP_RUN_STATUSES.FAILED,
          errorMessage: JSON.stringify(error),
        })
      }
    } catch (err: any) {
      res.send({
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.FAILED,
        errorMessage: JSON.stringify(err),
      })
    }
  })
}
