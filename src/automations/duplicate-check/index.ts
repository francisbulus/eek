import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'
import { findDuplicateRecords } from './helper'

// Modify these to match the definitions in ./handler
const inputYupSchema = yup
  .object({
    records: yup.array(yup.object().required().nullable()).nullable(),
    duplicate_check_config: yup
      .object({
        baseVariableID: yup.string().required(),
        record_key: yup.string().required(),
      })
      .required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    duplicateRecords: yup.array(yup.object().notRequired()).required(),
    duplicateRecordsCount: yup.number().required(),
    nonDuplicateRecords: yup.array(yup.object().notRequired()).required(),
    nonDuplicateRecordsCount: yup.number().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      // This should be the same for every automation, validating the basics
      const { stepRunId, token } = validateBasics(req)

      // Validating the inputs
      const inputData = inputYupSchema.validateSync(req.body.data)

      const duplicate_check_config = inputData.duplicate_check_config
      const records = inputData.records ?? []

      logger.debug('Running Duplicate Check', duplicate_check_config)
      // check for duplicate records

      const [
        duplicateRecords,
        duplicateRecordsCount,
        nonDuplicateRecords,
        nonDuplicateRecordsCount,
      ] = await findDuplicateRecords(duplicate_check_config, records)

      const output = {
        duplicateRecords,
        duplicateRecordsCount,
        nonDuplicateRecords,
        nonDuplicateRecordsCount,
      }

      // You shouldn't need to change anything below here
      const outputData = outputYupSchema.cast(output)

      logger.debug('Running Duplicate Check Finished')
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
