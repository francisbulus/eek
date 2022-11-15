import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { find, isEmpty } from 'lodash/fp'
import pMap from 'p-map'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../constants'
import { ultron } from '../../external/ultron'
import { BusinessInstanceNotFound, handleError, ValidationError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'

const inputYupSchema = yup
  .object({
    variables: yup
      .array(
        yup.object({
          source: yup.string().required(),
          target: yup.string().required(),
        })
      )
      .required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.find({
        id: stepRunId,
      })

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const { variables } = inputYupSchema.validateSync(req.body.data)
      if (isEmpty(variables)) {
        throw new ValidationError('"variables" list is required')
      }

      const childBaseRun = await ultron.baseRun.findById(stepRun.baseRunId)
      const parentBaseRun = await ultron.baseRun.findById(childBaseRun.parentId as string)

      const mapped = variables.map((v) => {
        const source = find({ baseVariableId: v.source }, parentBaseRun.baseRunVariables)
        const target = find({ baseVariableId: v.target }, childBaseRun.baseRunVariables)
        if (!source)
          throw new ValidationError(`'source' base variable '${v.source}' does not exist`)
        if (!target)
          throw new ValidationError(`'target' base variable '${v.target}' does not exist`)
        return { source, target }
      })

      const updateVariables = mapped.map((row) => ({
        baseRunId: childBaseRun.id as string,
        baseVariableId: row.target?.baseVariableId as string,
        value: row.source?.value as any,
      }))

      await pMap(updateVariables, async (v) => {
        await ultron.baseRun.updateVariableValue(v)
      })

      res.send({
        stepRunId,
        token,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
}
