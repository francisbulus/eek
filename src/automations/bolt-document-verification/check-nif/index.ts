import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import axios from 'axios'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { validateBasics } from '../../../helpers/yup'

const inputYupSchema = yup
  .object({
    nif: yup.string().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    status: yup.string().required(),
  })
  .required()

const scrapNif = async ({ nif }: { nif: string | number }): Promise<string> => {
  const url = `https://www.nif.pt/?q=${nif}`
  const result = await axios.get(url)

  const EXISTS_SNIPPET =
    'O NIF indicado é válido mas não conseguimos determinar a entidade associada.'
  const NOT_EXISTS_SNIPPET =
    'O NIF indicado não é válido e não encontramos resultados na pesquisa por nome em empresas.'
  if (result.data.includes(EXISTS_SNIPPET)) {
    return 'pass'
  } else if (result.data.includes(NOT_EXISTS_SNIPPET)) {
    return 'fail'
  }

  throw new Error('Could not determine if NIF exists')
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(req.body.data)

      const status = await scrapNif({ nif: inputData.nif })
      const outputData = outputYupSchema.cast({
        status,
      })

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
