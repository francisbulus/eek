import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

// Modify these to match the definitions in ./handler
const inputYupSchema = yup
  .object({
    pipeInput: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    pipeOutput: yup.string().required(),
  })
  .required()

// You can define as many helper functions as you want either here in this file, or in other files in
// the same subdirectory.
// Since this is an example, we simply return what was input, in the proper output format
const pipeInputToOutput = ({ pipeInput }: { pipeInput: string }) => {
  return {
    pipeOutput: pipeInput,
  }
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      // This should be the same for every automation, validating the basics
      const { stepRunId, token } = validateBasics(req)

      // Validating the inputs
      const inputData = inputYupSchema.validateSync(req.body.data)

      //------------------------------------------------------------------------------
      // This is where you would do the actual work of the automation.
      // Write the logic in another function, and just call it here
      //------------------------------------------------------------------------------
      const output = pipeInputToOutput(inputData)

      // You shouldn't need to change anything below here
      const outputData = outputYupSchema.cast(output)

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      // You shouldn't need to change this
      handleError({ err, req, res })
    }
  })
}
