import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { mapValues } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { IRow, ITable, mapFields } from '../../helpers/arrays'
import { handleError } from '../../helpers/errors'
import { isMustacheTemplate, renderSheetValue } from '../../helpers/mustache'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    arrayInput: yup.array().of(yup.object().required()).required(),
    destinationHeaderRow: yup.array().of(yup.string().required()).required(),
    fieldMapping: yup.object().required(),
    includeDestinationHeader: yup.boolean().default(false),
  })
  .required()

const outputYupSchema = yup
  .object({
    arrayOutput: yup.array().of(yup.array().of(yup.string())).required(),
  })
  .required()

const main = ({
  arrayInput,
  destinationHeaderRow,
  fieldMapping,
  includeDestinationHeader,
}: {
  arrayInput: ITable
  destinationHeaderRow: string[]
  fieldMapping: Record<string, string | null | undefined>
  includeDestinationHeader?: boolean
}) => {
  const theFieldMapping = mapValues((v: string | null | undefined) => {
    if (!v) return v
    if (isMustacheTemplate(v)) {
      return (o: IRow) => renderSheetValue({ templateString: v, view: o })
    }
    return v
  })(fieldMapping)

  return mapFields({
    values: arrayInput,
    destinationHeaderRow,
    fieldMapping: theFieldMapping,
    includeDestinationHeader,
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = { arrayOutput: await main(inputData) }
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

export { main }
