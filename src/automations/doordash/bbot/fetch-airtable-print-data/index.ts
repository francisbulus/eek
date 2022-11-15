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
        await airtableSignageBase('Print File')
          .select({ filterByFormula: "{Print File Status} = 'Print File - Not Started'" })
          .firstPage()
      ).map((record: Record<string, any>) => ({
        ...record.fields,
        'DRI - Vendor (from Design)': record.fields['DRI - Vendor (from Design)']
          ?.map((field: { id: string; email: string; name: string }) => field.name)
          .join(', '),
        'Final Design File (from Design)': record.fields['Final Design File (from Design)']
          ?.map((field: { url: string }) => field.url)
          .join(', '),
        'Final Print File': record.fields['Final Print File']
          ?.map((field: { url: string }) => field.url)
          .join(', '),
      }))

      const result = await pMap(
        queryPayload,
        async (record) => {
          let designRef = ''

          if (record['Design']) {
            const designData = (await airtableSignageBase('Design').find(record['Design'][0]))
              .fields

            designRef = designData['Name'] as string
          }

          return {
            ...record,
            Design: designRef,
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
