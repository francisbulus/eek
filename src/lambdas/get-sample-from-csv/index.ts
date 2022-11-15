import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { getSampleData } from '../../helpers/csv'
import { handleError } from '../../helpers/errors'

const inputYupSchema = yup
  .object({
    csvFileUrl: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    sampleData: yup.object(),
  })
  .required()

const main = async ({ csvFileUrl }: { csvFileUrl: string }) => getSampleData(csvFileUrl)

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const inputData = inputYupSchema.validateSync(req.body)

    const output = { sampleData: await main(inputData) }
    const outputData = outputYupSchema.cast(output)

    res.send(outputData)
  } catch (err: any) {
    handleError({ err, req, res })
  }
}
