import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { manticoreProcessEngine } from '../../../external/manticore'
import { handleError } from '../../../helpers/errors'

const inputYupSchema = yup
  .object({
    num1: yup.number().required(),
    num2: yup.number().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    num3: yup.number().required(),
  })
  .required()

const addNums = ({ num1, num2 }: { num1: number; num2: number }) => {
  return {
    num3: num1 + num2,
  }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const stepRunId: string = req.body.stepRunId
    const inputData = inputYupSchema.validateSync(req.body.data)

    const output = addNums(inputData)
    const outputData = outputYupSchema.cast(output)

    manticoreProcessEngine.callback({
      stepRunId,
      data: outputData,
      status: STEP_RUN_STATUSES.DONE,
    })

    res.send({
      stepRunId,
      data: {},
      status: STEP_RUN_STATUSES.RUNNING,
    })
  } catch (err: any) {
    handleError({ err, req, res })
  }
}
