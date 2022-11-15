import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { map, mapValues, pick, trim } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { IRow, ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup.array().of(yup.object().required()).required(),
    fields: yup.array().of(yup.string().required()),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup.array().of(yup.object()),
  })
  .required()

const trimInput = ({ arrayInput, fields }: { arrayInput: ITable; fields?: string[] }) =>
  fields
    ? map((obj: IRow) => ({ ...obj, ...mapValues(trim, pick(fields, obj)) }), arrayInput)
    : map((object) => mapValues(trim, object), arrayInput)

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: trimInput(inputData) }
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

export { trimInput }
