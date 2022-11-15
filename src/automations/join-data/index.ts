import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { compact, find, map, uniq } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup.array().of(yup.object().required()).required(),
    arrayInput2: yup.array().of(yup.object().required()).required(),
    column: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup.array().of(yup.object()),
  })
  .required()

const joinData = ({
  arrayInput,
  arrayInput2,
  column,
}: {
  arrayInput: ITable
  arrayInput2: ITable
  column: string
}) => {
  const allVals = compact(uniq([...map(column, arrayInput), ...map(column, arrayInput2)]))
  return map((val: string) => {
    const row1 = find({ [column]: val }, arrayInput)
    const row2 = find({ [column]: val }, arrayInput2)
    return { ...(row1 ?? {}), ...(row2 ?? {}) }
  }, allVals)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: await joinData(inputData) }
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

export { joinData }
