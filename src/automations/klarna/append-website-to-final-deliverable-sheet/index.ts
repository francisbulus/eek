import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { appendRows, getSheets, getSpreadsheetId } from '../../../helpers/google/sheets'
import { validateBasics } from '../../../helpers/yup'
import { DATA_SHEET_IDX } from '../helpers/constants'

const inputYupSchema = yup
  .object({
    spreadsheetUrl: yup.string().required(),
    brand: yup.string().required(),
    url: yup.string().required(),
    country: yup.string().required(),
    productDisplayPage: yup.array().of(yup.string()).required(),
    checkout: yup.array().of(yup.string()).required(),
    notes: yup.string(),
    type: yup.string(),
    productDisplayPageFreeText: yup.array().of(yup.string()).required(),
    checkoutFreeText: yup.array().of(yup.string()).required(),
  })
  .required()

const appendWebsite = async ({
  spreadsheetUrl,
  brand,
  url,
  country,
  productDisplayPage,
  checkout,
  notes,
  type,
  productDisplayPageFreeText,
  checkoutFreeText,
}: {
  spreadsheetUrl: string
  brand: string
  url: string
  country: string
  productDisplayPage: string[]
  checkout: string[]
  notes?: string
  type?: string
  productDisplayPageFreeText?: string[]
  checkoutFreeText?: string[]
}): Promise<void> => {
  if (type !== 'complex') throw new Error('Only spreadsheets of type "complex" are supported')
  const values = [
    [brand, url, country]
      .concat(productDisplayPage)
      .concat(productDisplayPageFreeText ?? [])
      .concat(checkout)
      .concat(checkoutFreeText ?? [])
      .concat([notes ?? '']),
  ]
  const spreadsheetId = await getSpreadsheetId(spreadsheetUrl)
  const sheets = await getSheets({ spreadsheetId })
  if (!sheets || !sheets[DATA_SHEET_IDX]) throw new Error('Spreadsheet does not exist')
  const tabName = sheets[DATA_SHEET_IDX].properties?.title || ''

  await appendRows({
    range: 'A:S',
    spreadsheetId,
    tabName,
    values,
    insertDataOption: 'OVERWRITE',
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      await appendWebsite({
        ...inputData,
      })

      const outputData = {}

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
