import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { getEmailsForDomains } from '../../external/hunter'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    table: yup
      .array()
      .of(yup.object({ domain: yup.string().required(), department: yup.string() }).required())
      .required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    emails: yup.array().of(
      yup.object({
        value: yup.string().required(),
        type: yup.string().required(),
        confidence: yup.number().required(),
        seniority: yup.string().nullable(),
        department: yup.string().nullable(),
        first_name: yup.string().nullable(),
        last_name: yup.string().nullable(),
        position: yup.string().nullable(),
        linkedin: yup.string().nullable(),
        twitter: yup.string().nullable(),
        phone_number: yup.string().nullable(),
        domain: yup.string().required(),
      })
    ),
  })
  .required()

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { emails: await getEmailsForDomains(inputData) }
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
