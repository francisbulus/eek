import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { ITable } from '../../../helpers/arrays'
import { handleError } from '../../../helpers/errors'
import {
  getSheetData,
  getSheets,
  getSpreadsheetId,
  writeToSheet,
} from '../../../helpers/google/sheets'
import { validateBasics } from '../../../helpers/yup'
import {
  DATA_COLUMNS_FLEET,
  DATA_COLUMNS_INDIVIDUAL,
  DATA_RANGE_FLEET,
  DATA_RANGE_INDIVIDUAL,
  DATA_RANGE_OUTPUT_FLEET,
  DATA_RANGE_OUTPUT_INDIVIDUAL,
  DATA_SHEET_FLEET,
  DATA_SHEET_INDIVIDUAL,
  MAX_CASES,
} from '../helpers/constants'

const inputYupSchema = yup
  .object({
    spreadsheetUrl: yup.string().required(),
  })
  .required()

const outputYupSchema = yup.object({
  input_data: yup
    .array(
      yup.object({
        type: yup.string().required(),
        ref: yup.string().required(),
        name: yup.string().required(),
        surname: yup.string().required(),
        email: yup.string().required(),
        phone: yup.string().required(),
        nif: yup.string().required(),
        nifProof: yup.string(),
        accountRecipient: yup.string(),
        id: yup.array().of(yup.string()).required(),
        selfie: yup.array().of(yup.string()).required(),
        criminalRecordURL: yup.string().required(),
        selfEmploymentDoc: yup.string(),
        iban: yup.string(),
        ibanProof: yup.string(),
        subscriptionDate: yup.date().required(),
      })
    )
    .required(),
})

type Verification = yup.InferType<typeof outputYupSchema>['input_data'][number]

const fetchSheet = async (
  spreadsheetId: string,
  type: string,
  tabName: string,
  range: string,
  columns: string[],
  rangeTmpl: string,
  stepRunId: string | number
) => {
  logger.info(`[${stepRunId}] Reading sheet - ${type} start`)
  const values = (await getSheetData({
    spreadsheetId,
    tabName,
    range,
    convertToObjects: false,
  })) as string[][]
  logger.info(`[${stepRunId}] Count of all rows: sheet - ${type}, count: ${values.length}`)
  const found = values
    .map((value, row) => ({ value, row }))
    .filter(
      ({ value }) => value[columns.indexOf('ref')] && !value[columns.indexOf('verificationStatus')]
    )
    .filter((v, idx) => idx < MAX_CASES)

  logger.info(`[${stepRunId}] Count of found rows: sheet - ${type}, count: ${values.length}`)

  const data: Verification[] = []
  logger.info(`[${stepRunId}] Writing to sheet start`)
  for (const { value, row } of found) {
    const range = rangeTmpl.replace(/<ROW>/gi, (row + 1).toString())
    const outputValues = ([['', '', false, '']] as unknown) as ITable

    await writeToSheet({
      spreadsheetId,
      tabName,
      range,
      values: outputValues,
    })

    const id = [value[columns.indexOf('idFront')], value[columns.indexOf('idBack')]]

    const selfie = [value[columns.indexOf('idFront')], value[columns.indexOf('selfieWithId')]]

    data.push({
      subscriptionDate: new Date(value[columns.indexOf('subscriptionDate')]),
      type,
      name: value[columns.indexOf('name')],
      surname: value[columns.indexOf('surname')],
      email: value[columns.indexOf('email')],
      phone: value[columns.indexOf('phone')],
      nif: value[columns.indexOf('nif')],
      nifProof: columns.indexOf('nifProof') >= 0 ? value[columns.indexOf('nifProof')] : '',
      accountRecipient: value[columns.indexOf('accountRecipient')],
      selfie,
      id,
      criminalRecordURL: value[columns.indexOf('criminalRecordURL')],
      selfEmploymentDoc: value[columns.indexOf('selfEmploymentDoc')],
      iban: value[columns.indexOf('iban')],
      ibanProof: value[columns.indexOf('ibanProof')],
      ref: value[columns.indexOf('ref')],
    })
  }
  logger.info(`[${stepRunId}] Count of Verified data- ${type}: ${data.length}`)

  logger.info(`[${stepRunId}] Writing to sheet stop`)

  logger.info(`[${stepRunId}] Reading sheet - ${type} stop`)
  return data
}

const importVerification = async ({
  spreadsheetUrl,
  stepRunId,
}: {
  spreadsheetUrl: string
  stepRunId: string | number
}): Promise<Verification[]> => {
  logger.info(`[${stepRunId}] Import Verification start`)
  const spreadsheetId = await getSpreadsheetId(spreadsheetUrl)
  const sheets = await getSheets({ spreadsheetId })
  const individualSheet = sheets?.find(
    ({ properties }) => properties?.title === DATA_SHEET_INDIVIDUAL
  )
  const fleetSheet = sheets?.find(({ properties }) => properties?.title === DATA_SHEET_FLEET)
  if (!individualSheet || !fleetSheet) {
    throw new Error('No sheet found')
  }
  const data: Verification[] = []
  if (individualSheet) {
    logger.info(`[${stepRunId}] Import Verification - Getting sheet data for type - Individual`)
    const type = 'individual'
    const tabName = DATA_SHEET_INDIVIDUAL
    const range = DATA_RANGE_INDIVIDUAL
    const columns = DATA_COLUMNS_INDIVIDUAL
    const rangeTmpl = DATA_RANGE_OUTPUT_INDIVIDUAL
    const sheetData = await fetchSheet(
      spreadsheetId,
      type,
      tabName,
      range,
      columns,
      rangeTmpl,
      stepRunId
    )
    data.push(...sheetData)
  }
  if (fleetSheet) {
    logger.info(`[${stepRunId}] Import Verification - Getting sheet data for type - Fleet`)
    const type = 'fleet'
    const tabName = DATA_SHEET_FLEET
    const range = DATA_RANGE_FLEET
    const columns = DATA_COLUMNS_FLEET
    const rangeTmpl = DATA_RANGE_OUTPUT_FLEET
    const sheetData = await fetchSheet(
      spreadsheetId,
      type,
      tabName,
      range,
      columns,
      rangeTmpl,
      stepRunId
    )
    data.push(...sheetData)
  }

  return data
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    let sid = null
    try {
      logger.info(`Import Start`)
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      sid = stepRunId
      logger.info(`Import stepRunId - ${stepRunId}`)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const verifications = await importVerification({
        ...inputData,
        stepRunId,
      })

      const outputData = outputYupSchema.cast({
        input_data: verifications,
      })

      logger.info(`[${stepRunId}] Import End`)
      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      logger.error(`[${sid}] Bolt Document Verification Import Error`, err)
      handleError({ err, req, res })
    }
  })
}
