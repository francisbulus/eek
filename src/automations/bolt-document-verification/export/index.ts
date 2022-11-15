import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import moment from 'moment-timezone'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { ultron } from '../../../external/ultron'
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
  NO_SCREENSHOT,
  SELFIE_STEP_ID,
} from '../helpers/constants'

const inputYupSchema = yup
  .object({
    spreadsheetUrl: yup.string().url().required(),
    type: yup.string().oneOf(['individual', 'fleet']).required(),
    ref: yup.string().required(),
    status: yup.string().required(),
    failureReason: yup.string().required(),
    screenshotUrl: yup.string().url(),
  })
  .required()

const fetchAgent = async ({
  stepRunId,
}: {
  stepRunId?: string
}): Promise<{
  name: string
}> => {
  const DEFAULT_NAME = 'Invisible'
  // stepRunId coming undefined is a bug, but we don't want to crash the whole process
  if (!stepRunId) {
    return Promise.resolve({ name: DEFAULT_NAME })
  }
  const thisStepRun = await ultron.stepRun.findById(stepRunId)
  const firstStepRun = await ultron.stepRun.find({
    stepId: SELFIE_STEP_ID,
    baseRunId: thisStepRun.baseRunId,
    expand: {
      assignee: true,
    },
  })

  return firstStepRun?.assignee ?? { name: DEFAULT_NAME }
}

const updateVerification = async ({
  stepRunId,
  spreadsheetUrl,
  type,
  ref,
  status,
  failureReason,
  screenshotUrl,
}: {
  stepRunId: string | number
  spreadsheetUrl: string
  type: string
  ref: string
  status: string
  failureReason: string
  screenshotUrl?: string
}): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId(spreadsheetUrl)
  const sheets = await getSheets({ spreadsheetId })

  let sheet
  let dataRange
  let columns = [] as string[]
  if (type === 'individual') {
    sheet = sheets?.find(({ properties }) => properties?.title === DATA_SHEET_INDIVIDUAL)
    dataRange = DATA_RANGE_INDIVIDUAL
    columns = DATA_COLUMNS_INDIVIDUAL
  } else if (type === 'fleet') {
    sheet = sheets?.find(({ properties }) => properties?.title === DATA_SHEET_FLEET)
    dataRange = DATA_RANGE_FLEET
    columns = DATA_COLUMNS_FLEET
  }

  if (!sheet) {
    throw new Error('Sheet not found')
  }

  const values = (await getSheetData({
    spreadsheetId,
    tabName: sheet.properties?.title as string,
    range: dataRange,
    convertToObjects: false,
  })) as string[][]

  const foundIdx = values.map((v) => v[columns.indexOf('ref')]).indexOf(ref)

  if (foundIdx < 0) {
    throw new Error('Verification not found')
  }

  const found = values[foundIdx]

  const row = values.indexOf(found) + 1
  const rangeTmpl = type === 'individual' ? DATA_RANGE_OUTPUT_INDIVIDUAL : DATA_RANGE_OUTPUT_FLEET
  const range = rangeTmpl.replace(/<ROW>/gi, row.toString())

  const now = moment().utc().format('YYYY-MM-DD')
  const agent = await fetchAgent({ stepRunId: stepRunId as string })
  const actualScreenshotUrl = screenshotUrl !== NO_SCREENSHOT ? screenshotUrl : ''
  const outputValues = ([
    [
      agent.name,
      now,
      status === 'pass',
      status === 'pass' ? '' : failureReason,
      actualScreenshotUrl,
    ],
  ] as unknown) as ITable

  await writeToSheet({
    spreadsheetId,
    tabName: sheet.properties?.title as string,
    range,
    values: outputValues,
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      await updateVerification({
        stepRunId,
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
