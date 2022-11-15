import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { concat, constant, flow, map, max, size, times } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import {
  getSheetData,
  getSheets,
  getSpreadsheetId,
  writeToSheet,
} from '../../../helpers/google/sheets'
import { validateBasics } from '../../../helpers/yup'
import { DATA_RANGE, DATA_SHEET_IDX } from '../helpers/constants'

const inputYupSchema = yup
  .object({
    spreadsheetUrl: yup.string().required(),
  })
  .required()

const sortWebsites = async ({ spreadsheetUrl }: { spreadsheetUrl: string }): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId(spreadsheetUrl)
  const sheets = await getSheets({ spreadsheetId })
  if (!sheets || !sheets[DATA_SHEET_IDX]) throw new Error('Spreadsheet does not exist')
  const tabName = sheets[DATA_SHEET_IDX].properties?.title || ''
  const values = (await getSheetData({
    spreadsheetId,
    tabName,
    range: DATA_RANGE,
    convertToObjects: false,
  })) as string[][]
  const sortedValues = values.sort((a, b) => {
    const aBrand = a[0] || ''
    const bBrand = b[0] || ''
    if (aBrand < bBrand) return -1
    if (aBrand > bBrand) return 1
    return 0
  })

  // Fill values up to max length to force empty cells to continue empty after sort update.
  const maxLength = flow(map(size), max)(sortedValues) as number
  const filledAndSortedValues = sortedValues.map((sv) => {
    if (sv.length === maxLength) return sv

    const diff = maxLength - sv.length
    return concat(sv, times(constant(''), diff))
  })

  await writeToSheet({
    spreadsheetId,
    tabName,
    range: DATA_RANGE,
    values: filledAndSortedValues,
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      await sortWebsites({
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
