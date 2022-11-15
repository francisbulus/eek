import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { filter, map } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup.array().of(yup.object().required()).required(),
    matches: yup.array().of(yup.string().required()).required(),
    field: yup.string().required(),
    caseSensitive: yup.boolean(),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup.array().of(yup.object()),
  })
  .required()

const filterInput = ({
  arrayInput,
  matches,
  field,
  caseSensitive,
}: {
  arrayInput: ITable
  matches: string[]
  field: string
  caseSensitive?: boolean
}) => {
  if (!caseSensitive) {
    const processedMatches = map((match) => match.toLowerCase().trim(), matches)
    return filter(
      (item) => processedMatches.includes(item[field] ? item[field]!.toLowerCase().trim() : ''),
      arrayInput
    )
  } else {
    const processedMatches = map((match) => match.trim(), matches)
    return filter(
      (item) => processedMatches.includes(item[field] ? item[field]!.trim() : ''),
      arrayInput
    )
  }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: filterInput(inputData) }
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

export { filterInput }
