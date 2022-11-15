import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import pMap from 'p-map'
import * as yup from 'yup'

import { establishAirtableConnection, getAirtableBase } from '../../../../config/airtable'
import { STEP_RUN_STATUSES } from '../../../../constants'
import { handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'

const outputYupSchema = yup
  .object({
    data: yup.array().of(yup.object({})),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      await establishAirtableConnection('doordash')

      const airtableSignageBase = getAirtableBase('appgZgVs55vl0MWtA') // Design & Print AT Base ID

      const queryPayload = (
        await airtableSignageBase('Design')
          .select({ filterByFormula: "{Design Status} = 'Design - Not Started'" })
          .firstPage()
      ).map((record: Record<string, any>) => ({
        ...record.fields,
        'DRI - Vendor': record.fields['DRI - Vendor']
          ?.map((field: { id: string; email: string; name: string }) => field.name)
          .join(', '),
        'Mx Logo (from Request Stage)': record.fields['Mx Logo (from Request Stage)']
          ?.map((field: { url: string }) => field.url)
          .join(', '),
        'Example Photos (Optional) (from Request Stage)': record.fields[
          'Example Photos (Optional) (from Request Stage)'
        ]
          ?.map((field: { url: string }) => field.url)
          .join(', '),
        'Design Preview Image': record.fields['Design Preview Image']
          ?.map((field: { url: string }) => field.url)
          .join(', '),
        'Final Design File': record.fields['Final Design File']
          ?.map((field: { url: string }) => field.url)
          .join(', '),
      }))

      const result = await pMap(
        queryPayload,
        async (record) => {
          const requestStageData = (
            await airtableSignageBase('Request Stage').find(record['Request Stage'][0])
          ).fields

          let printFile = ''

          if (record['Print File']) {
            const printFileData = (
              await airtableSignageBase('Print File').find(record['Print File'][0])
            ).fields

            printFile = printFileData['Name'] as string
          }

          return {
            ...record,
            'Request Stage': requestStageData['Design ID'],
            'Print File': printFile,
          }
        },
        { concurrency: 1 }
      )

      const output = { data: result }

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
