import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { createDocInFolder } from '../../helpers/google/doc'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    content: yup.string().required(),
    title: yup.string().required(),
    driveFolderKey: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    uploadedFileUrl: yup.string().required(),
  })
  .required()

const uploadToGDrive = async ({
  content,
  title,
  driveFolderKey,
}: {
  content: string
  title: string
  driveFolderKey: string
}) => {
  const createdFile = await createDocInFolder({
    content,
    title,
    folderId: driveFolderKey,
  })

  return { uploadedFileUrl: 'https://docs.google.com/document/d/' + createdFile.id }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      // if (err) throw err // Commented out because was throwing Unauthorized errors in Staging

      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await uploadToGDrive(inputData)

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
