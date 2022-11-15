import { NowRequest, NowResponse } from '@vercel/node'
import { first, isEmpty } from 'lodash/fp'
import * as yup from 'yup'

import { IRow, ITable } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { getSheetData, getSpreadsheetId } from '../../helpers/google/sheets'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    tabName: yup.string().required(),
    range: yup.string().notRequired().nullable(),
  })
  .required()

const outputYupSchema = yup
  .object({
    sampleData: yup.object(),
  })
  .required()

const main = async ({
  googleSheetUrl,
  tabName,
  range,
}: {
  googleSheetUrl: string
  tabName: string
  range?: string | null
}): Promise<IRow> => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const data = (await getSheetData({
    spreadsheetId,
    tabName,
    range: range ?? undefined,
  })) as ITable

  if (isEmpty(data)) throw new Error(`Couldn't read from sheet: ${spreadsheetId}, ${range}`)

  return first(data) as IRow
}

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

export { main } // for testing
