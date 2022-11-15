import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import { isEmpty } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { getSheetData, getSpreadsheetId } from '../../helpers/google/sheets'
import { ValueRenderOption } from '../../helpers/types'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    googleSheetUrl: yup.string().required(),
    tabName: yup.string().notRequired(),
    columns: yup.array().of(yup.string().required()).notRequired().nullable(),
    range: yup.string().notRequired().nullable(),
    valueRenderOption: yup.mixed<ValueRenderOption>().oneOf(Object.values(ValueRenderOption)),
  })
  .required()

const outputYupSchema = yup
  .object({
    outputArrayOfObjects: yup.array().of(yup.object()).required(),
  })
  .required()

const readGoogleSheet = async ({
  googleSheetUrl,
  tabName,
  range,
  columns,
  valueRenderOption,
}: {
  googleSheetUrl: string
  tabName?: string
  range?: string | null
  columns?: string[] | null
  valueRenderOption?: ValueRenderOption
}) => {
  const spreadsheetId = getSpreadsheetId(googleSheetUrl)
  return getSheetData({
    spreadsheetId,
    tabName,
    range: range ?? undefined,
    columns: isEmpty(columns) ? undefined : columns!,
    valueRenderOption,
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      logger.debug(`Running google sheet handler`, req.body.data)

      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      logger.debug('reading...')
      const output = { outputArrayOfObjects: await readGoogleSheet(inputData) }

      logger.debug('read')

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
