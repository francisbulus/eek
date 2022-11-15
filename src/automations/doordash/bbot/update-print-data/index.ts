import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import type { Attachment } from 'airtable'
import * as yup from 'yup'

import { establishAirtableConnection, getAirtableBase } from '../../../../config/airtable'
import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'

const inputYupSchema = yup
  .object({
    printFileStatus: yup.string().required(),
    finalPrintFile: yup.string().nullable(),
    notesFromVendor: yup.string(),
    recordID: yup.string().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      await establishAirtableConnection('doordash')

      const airtableSignageBase = getAirtableBase('appgZgVs55vl0MWtA') // Design & Print AT Base ID

      const {
        printFileStatus,
        finalPrintFile,
        notesFromVendor,
        recordID,
      } = inputYupSchema.validateSync(req.body.data)

      const previousPrintFiles =
        ((await airtableSignageBase('Print File').find(recordID)).fields[
          'Final Print File'
        ] as Attachment[]) ?? []

      const previousFilenames = previousPrintFiles.reduce(
        (acc, current) => [...acc, current.filename],
        [] as string[]
      )

      const filesToUpload = (finalPrintFile
        ?.split(', ')
        .map((url) => ({ url }))
        .filter(({ url }) => {
          const filename = url.split('/')[url.split('/').length - 1]

          return !previousFilenames.includes(filename)
        }) as unknown) as Attachment['url'][]

      await airtableSignageBase('Print File').update(
        recordID,
        {
          'Print File Status': printFileStatus,
          'Final Print File': [
            ...(previousPrintFiles && previousPrintFiles?.map((file) => ({ id: file.id }))),
            ...(filesToUpload ?? []),
          ] as Attachment[],
          'Notes From Vendor': notesFromVendor,
        },
        { typecast: true }
      )

      res.send({
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
