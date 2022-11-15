import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { uniqBy } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { ultron } from '../../../external/ultron'
import { IRow } from '../../../helpers/arrays'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import {
  RESTAURANT_CODE_BASE_VAR_ID,
  RESTAURANTS_BASE_ID,
} from './../../../external/datassential/constants'
import { importSheet } from './response'

// Modify these to match the definitions in ./handler
const inputYupSchema = yup
  .object({
    sheetUrl: yup.string().required(),
    sheetTab: yup.string().required(),
    restType: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    data: yup.array().of(yup.object()).nullable(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      let rows: IRow[] = uniqBy('Code', (await importSheet(inputData)) as IRow[])

      if (rows.length > 0) {
        const baseRuns = await ultron.baseRun.findMany({
          where: {
            baseId: RESTAURANTS_BASE_ID,
          },
          includeBaseVariableIds: [RESTAURANT_CODE_BASE_VAR_ID],
        })
        const restCodes = baseRuns.map((br) =>
          br.baseRunVariables.reduce((v, cur) => cur.value, '')
        )
        rows = rows.filter((row: IRow) => !restCodes.includes(row.Code as string))
      }

      const output = { data: rows }

      const outputData = outputYupSchema.cast(output)
      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      // You shouldn't need to change this
      handleError({ err, req, res })
    }
  })
}
