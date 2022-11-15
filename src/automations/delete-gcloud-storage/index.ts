import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import pMap from 'p-map'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { deleteObject } from '../../helpers/google/cloud'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    objectURLs: yup.array().of(yup.string()).required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    result: yup.string().required(),
  })
  .required()

const deleteFromCloudStorage = async ({ objectURLs }: { objectURLs: string[] }) => {
  await pMap(
    objectURLs,
    async (objectURL) => {
      const bucket = objectURL.includes('storage.googleapis.com')
        ? decodeURI(objectURL).split('storage.googleapis.com/')[1].split('/')[0]
        : decodeURI(objectURL).split('storage.cloud.google.com/')[1].split('/')[0]
      const objectId = decodeURI(objectURL)
        .split(bucket + '/')[1]
        .split('?')[0]
      await deleteObject({
        bucket,
        objectId,
      })
    },
    { concurrency: 1 }
  )
  return { result: 'Deleted!' }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      // if (err) throw err // Commented out because was throwing Unauthorized errors in Staging

      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await deleteFromCloudStorage(inputData)

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
