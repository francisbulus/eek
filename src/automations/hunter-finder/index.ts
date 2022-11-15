import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { map } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import {
  getEmailsForFinder,
  IHunterFinderArgs,
  IHunterFinderArgsFromStep,
} from '../../external/hunter'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    table: yup
      .array()
      .of(
        yup
          .object({
            firstName: yup.string().required(),
            lastName: yup.string().nullable(),
            company: yup.string().nullable(),
            domain: yup.string().nullable(),
          })
          .required()
      )
      .required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    emails: yup.array().of(
      yup.object({
        first_name: yup.string().required(),
        last_name: yup.string().required(),
        position: yup.string().required(),
        linkedin: yup.string().required(),
        twitter: yup.string().required(),
        phone_number: yup.string().required(),
        email: yup.string().required(),
      })
    ),
  })
  .required()

const main = async ({ table }: { table: IHunterFinderArgsFromStep[] }) => {
  const args: IHunterFinderArgs[] = map(
    (row: IHunterFinderArgsFromStep) => ({
      first_name: row.firstName,
      last_name: row.lastName ?? '',
      company: row.company ?? '',
      domain: row.domain ?? '',
    }),
    table
  )
  return getEmailsForFinder(args)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { emails: await main(inputData) }
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
