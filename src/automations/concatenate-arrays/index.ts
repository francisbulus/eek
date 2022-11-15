import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    inputArray1: yup.array().of(yup.object().required()).required(),
    inputArray2: yup.array().of(yup.object().required()).required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    outputArray: yup.array().of(yup.object().required()).required(),
  })
  .required()

const concatenateInput = ({
  inputArray1,
  inputArray2,
}: {
  inputArray1: ITable
  inputArray2: ITable
}) => [...inputArray1, ...inputArray2]

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { outputArray: concatenateInput(inputData) }
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

export { concatenateInput }
