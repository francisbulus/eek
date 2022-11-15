import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'
import { ID_FAILURE_REASONS, SELFIE_FAILURE_REASONS, STATUSES } from '../helpers/constants'

const FAILURE_REASONS = {
  IdFront: '1- Front of ID',
  IdBack: '2 - Back of ID',
  Nif: '3 - Proof of NIF',
  CriminalRecord: '4 - Criminal Record',
  SelfieWithId: '5 - Selfie Photo',
  Iban: '6 - Proof of IBAN',
  SelfEmployment: '7 - Self-employment proof',
}

const inputYupSchema = yup
  .object({
    criminalRecordStatus: yup.string().required(),
    ibanStatus: yup.string().required(),
    selfEmploymentStatus: yup.string().required(),
    nifStatus: yup.string().required(),
    checkIdStatus: yup.string().required(),
    checkIdFailureReason: yup.string().oneOf(ID_FAILURE_REASONS).required(),
    checkSelfieStatus: yup.string().required(),
    checkSelfieFailureReason: yup.string().oneOf(SELFIE_FAILURE_REASONS).required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    status: yup.string().oneOf(STATUSES).required(),
    failureReason: yup.string(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)
      let outputData

      if (inputData.checkIdFailureReason === 'front') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.IdFront,
        })
      } else if (inputData.checkIdFailureReason === 'back') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.IdBack,
        })
      } else if (inputData.checkSelfieFailureReason === 'front') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.IdFront,
        })
      } else if (inputData.checkSelfieFailureReason === 'selfie') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.SelfieWithId,
        })
      } else if (inputData.criminalRecordStatus === 'fail') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.CriminalRecord,
        })
      } else if (inputData.nifStatus === 'fail') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.Nif,
        })
      } else if (inputData.ibanStatus === 'fail') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.Iban,
        })
      } else if (inputData.selfEmploymentStatus === 'fail') {
        outputData = outputYupSchema.cast({
          status: 'fail',
          failureReason: FAILURE_REASONS.SelfEmployment,
        })
      } else {
        outputData = outputYupSchema.cast({
          status: 'pass',
          failureReason: '',
        })
      }

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
