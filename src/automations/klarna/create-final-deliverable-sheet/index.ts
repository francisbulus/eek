import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { countries } from 'country-data'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import {
  duplicateSpreadsheet,
  getSheets,
  getSpreadsheetId,
  getSpreadsheetTitle,
  getSpreadsheetUrl,
  makePublic,
  renameGoogleSheetTab,
  renameSpreadsheet,
  writeToSheet,
} from '../../../helpers/google/sheets'
import { moment } from '../../../helpers/moment'
import { validateBasics } from '../../../helpers/yup'
import { DATA_SHEET_IDX, STATS_SHEET_IDX } from '../helpers/constants'

const MARKET_MARKER = 'MARKET'
const SHORT_MARKET_MARKER = 'SMARKET'
const DATE_MARKER = 'DATE'
const COPY_PREFIX = 'Copy of '

const inputYupSchema = yup
  .object({
    country: yup.string().required(),
    refDate: yup.date().required(),
    templateUrl: yup.string().required(),
    pickList: yup
      .array()
      .of(
        yup.object({
          Providers: yup.string().required(),
        })
      )
      .required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    spreadsheetUrl: yup.string().required(),
  })
  .required()

const duplicate = async ({ googleSheetUrl }: { googleSheetUrl: string }) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  const newSheet = await duplicateSpreadsheet(spreadsheetId)
  await makePublic(newSheet.id || '')

  return newSheet.id!
}

const addMarketInfo = async ({
  spreadsheetId,
  country,
  shortMarket,
  date,
}: {
  spreadsheetId: string
  country: string
  shortMarket: string
  date: Date
}) => {
  const currTitle = (await getSpreadsheetTitle({ spreadsheetId })) || ''
  const currSheets = await getSheets({ spreadsheetId })
  const currDataSheetName = currSheets ? currSheets[DATA_SHEET_IDX]?.properties?.title : ''
  const currStatsSheetName = currSheets ? currSheets[STATS_SHEET_IDX]?.properties?.title : ''
  if (!currDataSheetName) throw new Error('Spreadsheet has no data sheet')
  if (!currStatsSheetName) throw new Error('Spreadsheet has no stats sheet')

  const addInfo = (str: string) =>
    str
      .replace(new RegExp(SHORT_MARKET_MARKER, 'g'), shortMarket)
      .replace(new RegExp(MARKET_MARKER, 'g'), country)
      .replace(new RegExp(DATE_MARKER, 'g'), moment(date).format('MMMM'))
      .replace(new RegExp(COPY_PREFIX, 'g'), '')

  const newTitle = addInfo(currTitle)
  const newDataSheetName = addInfo(currDataSheetName)
  const newStatsSheetName = addInfo(currStatsSheetName)

  await renameSpreadsheet({ spreadsheetId, newTitle })
  await renameGoogleSheetTab({
    spreadsheetId,
    newTabName: newDataSheetName,
    currentTabName: currDataSheetName,
  })
  await renameGoogleSheetTab({
    spreadsheetId,
    newTabName: newStatsSheetName,
    currentTabName: currStatsSheetName,
  })
}

const addPickList = async ({
  spreadsheetId,
  pickList,
}: {
  spreadsheetId: string
  pickList: { Providers: string }[]
}) => {
  const currSheets = await getSheets({ spreadsheetId })
  const currStatsSheetName = currSheets ? currSheets[STATS_SHEET_IDX]?.properties?.title : ''
  if (!currStatsSheetName) throw new Error('Spreadsheet has no stats sheet')

  await writeToSheet({
    spreadsheetId,
    tabName: currStatsSheetName,
    range: `A2:A${pickList.length + 1}`,
    values: pickList.map((item) => [item.Providers]),
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const spreadsheetId = await duplicate({ googleSheetUrl: inputData.templateUrl })
      const country = countries[inputData.country]
      const shortMarket = (country?.alpha2 as string) || inputData.country
      await addMarketInfo({
        spreadsheetId,
        date: inputData.refDate,
        country: inputData.country,
        shortMarket,
      })
      await addPickList({ spreadsheetId, pickList: inputData.pickList })

      const spreadsheetUrl = getSpreadsheetUrl(spreadsheetId)
      const outputData = outputYupSchema.cast({ spreadsheetUrl })
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
