import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const SIMPLE_URL =
  'https://docs.google.com/spreadsheets/d/1NC2owf5ZZOJa4HeqWCxzH7dVzeNN0kcDzh23uukwsAo'
const COMPLEX_URL =
  'https://docs.google.com/spreadsheets/d/1L4DzqX8B949nQewrPudqYWfdLJnMWSjCUL4mIv9FPe8'

const outputYupSchema = yup
  .object({
    simpleSpreadsheetUrl: yup.string().url().required(),
    completeSpreadsheetUrl: yup.string().url().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const outputData = outputYupSchema.cast({
        simpleSpreadsheetUrl: SIMPLE_URL,
        completeSpreadsheetUrl: COMPLEX_URL,
      })

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
