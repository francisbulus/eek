import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { isEmpty, isEqual, uniqWith } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { uniqByFields } from '../../helpers/lodash'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup.array().of(yup.object().required()).required(),
    fields: yup.array().of(yup.string().required()).nullable().notRequired(),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup.array().of(yup.object()),
  })
  .required()

const deDuplicateInput = ({
  arrayInput,
  fields,
}: {
  arrayInput: ITable
  fields?: string[] | null
}) => {
  if (!isEmpty(fields)) return uniqByFields({ fields: fields as string[], arrayInput })
  return uniqWith(isEqual, arrayInput)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: await deDuplicateInput(inputData) }
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

export { deDuplicateInput }
