import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { chunk } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup.array().of(yup.object().required()).required(),
    chunkSize: yup.number().integer().positive().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup.array().of(yup.object()),
  })
  .required()

const chunkInput = ({ arrayInput, chunkSize }: { arrayInput: ITable; chunkSize: number }) =>
  chunk(chunkSize, arrayInput)

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: chunkInput(inputData) }
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

export { chunkInput }
