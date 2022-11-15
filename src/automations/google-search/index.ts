import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'
import { search } from './search'

const inputYupSchema = yup
  .object({
    keywords: yup.array().of(yup.string().required()).required(),
    limitOfResultsPerKeyword: yup.number().nullable(),
  })
  .required()

const outputYupSchema = yup
  .object({
    searchOutputs: yup
      .array()
      .of(
        yup.object().shape({
          keyword: yup.string().required(),
          link: yup.string().required(),
          title: yup.string().required(),
          snippet: yup.string(),
          displayLink: yup.string(),
          formattedUrl: yup.string(),
          htmlTitle: yup.string(),
        })
      )
      .required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const searchOutputs = await search(inputData)

      const output = { searchOutputs }
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
