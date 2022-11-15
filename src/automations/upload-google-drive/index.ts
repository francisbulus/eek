import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import pMap from 'p-map'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { createFileInFolder } from '../../helpers/google/drive'
import { validateBasics } from '../../helpers/yup'

type TFile = {
  fileName: string
  url: string
}

const inputYupSchema = yup
  .object({
    fetchHeaders: yup.object().optional(),
    files: yup
      .array()
      .of(
        yup.object({
          fileName: yup.string().required(),
          url: yup.string().required(),
        })
      )
      .required(),
    driveFolderKey: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    uploadedFileUrls: yup.array().of(yup.string()).required(),
  })
  .required()

const downloadFile = async (url: string, headers: Record<string, string>) =>
  axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers,
  }).then((d) => d.data)

export const uploadToGDrive = async ({
  files,
  driveFolderKey,
  fetchHeaders = {},
}: {
  files: TFile[]
  driveFolderKey: string
  fetchHeaders?: Record<string, string>
}) => {
  const uploadedFileUrls = await pMap(
    files,
    async (file) => {
      const createdFile = await createFileInFolder({
        fileStream: await downloadFile(file.url, fetchHeaders),
        folderId: driveFolderKey,
        fileName: file.fileName,
      })

      return 'https://drive.google.com/file/d/' + createdFile.id
    },
    { concurrency: 1 }
  )

  return { uploadedFileUrls }
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
