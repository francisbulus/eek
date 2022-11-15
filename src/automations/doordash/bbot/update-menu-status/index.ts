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
    menuStatus: yup.string().required(),
    recordId: yup.string().required(),
    completedCsvMenu: yup.string().nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      await establishAirtableConnection('doordash')

      const airtableMenusBase = getAirtableBase('appJiDaLmWBJBfsPo') // Menus AT Base ID

      const { menuStatus, recordId, completedCsvMenu } = inputYupSchema.validateSync(req.body.data)

      const previousCsvFiles =
        ((await airtableMenusBase('Menu Requests').find(recordId)).fields[
          'Completed CSV Menus'
        ] as Attachment[]) ?? []

      const previousFilenames = previousCsvFiles.reduce(
        (acc, current) => [...acc, current.filename],
        [] as string[]
      )

      const filesToUpload = (completedCsvMenu
        ?.split(', ')
        .map((url) => ({ url }))
        .filter(({ url }) => {
          const filename = url.split('/')[url.split('/').length - 1]

          return !previousFilenames.includes(filename)
        }) as unknown) as Attachment['url'][]

      await airtableMenusBase('Menu Requests').update(
        recordId,
        {
          'Completed CSV Menus': [
            ...(previousCsvFiles && previousCsvFiles?.map((file) => ({ id: file.id }))),
            ...(filesToUpload ?? []),
          ] as Attachment[],
          'Menu Status': menuStatus,
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
