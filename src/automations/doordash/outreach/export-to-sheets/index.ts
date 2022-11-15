import { hasRole } from '@invisible/heimdall'
import { NowRequest, NowResponse } from '@vercel/node'
import { values } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { exportToSheets } from './response'

const inputYupSchema = yup
  .object({
    driveFolderKey: yup.string().required(),
    keyIds: yup.object().required(),
  })
  .required()

const outputYupSchema = yup
  .object({
    data: yup.string().required(),
  })
  .required()

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  return hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err
      const { stepRunId, token } = validateBasics(req)
      const stepRun = await ultron.stepRun.findById(stepRunId as string)
      const { driveFolderKey, keyIds } = inputYupSchema.validateSync(req.body.data)

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const currentStoreBaseRun = await ultron.baseRun.findById(stepRun.baseRunId)

      const allBatchOutreach = await ultron.baseRun.findMany({
        where: {
          parent: {
            parent: {
              id: currentStoreBaseRun.parentId,
            },
          },
        },
        includeBaseVariableIds: values(keyIds.outreach),
      })
      const storeOutreachMap = allBatchOutreach.reduce(
        (acc: Record<string, Record<string, any>[]>, o) => ({
          ...acc,
          [o.parentId as string]: [
            ...(acc[o.parentId as string] ? [...acc[o.parentId as string]] : []),
            o.baseRunVariables.reduce((vacc, v) => ({ ...vacc, [v.baseVariableId]: v.value }), {}),
          ],
        }),
        {}
      )

      const stores = await ultron.baseRun.findChildBaseRuns({
        parentBaseRunId: currentStoreBaseRun.parentId as string,
        baseId: currentStoreBaseRun.baseId as string,
      })
      const data = stores.map((store) => {
        const getValue = (baseVariableId: string, variables: any[]) =>
          variables.find((v) => v.baseVariable.id === baseVariableId)?.value
        const outreach = storeOutreachMap[store.id]
        return {
          'STORE ID': getValue(keyIds.stores['STORE_ID'], store.baseRunVariables),
          'STORE NAME': getValue(keyIds.stores['STORE_NAME'], store.baseRunVariables),
          'SUB MARKET NAME': getValue(keyIds.stores['SUB_MARKET_NAME'], store.baseRunVariables),
          ADDRESS: getValue(keyIds.stores['ADDRESS'], store.baseRunVariables),
          TIMEZONE: getValue(keyIds.stores['TIMEZONE'], store.baseRunVariables),
          'PHONE NUMBER': getValue(keyIds.stores['PHONE_NUMBER'], store.baseRunVariables),
          'TIME AND DATE': getValue(keyIds.stores['LAST_OUTREACH_DATE'], store.baseRunVariables),
          'DM NAME': outreach?.slice(-1)[0][keyIds.outreach['CONTACT_NAME']] ?? '', // Use contact from last outreach
          'DAY 1': outreach?.[0]?.[keyIds.outreach['UPDATE_OUTCOME']] ?? '',
          'DAY 2': outreach?.[1]?.[keyIds.outreach['UPDATE_OUTCOME']] ?? '',
          'DAY 3': outreach?.[3]?.[keyIds.outreach['UPDATE_OUTCOME']] ?? '',
          'REASON FOR REFUSAL TO UPDATE MENU':
            outreach?.map((o) => o[keyIds.outreach['REFUSAL_REASON']]).join(', ') ?? '',
          'OTHER NOTES': outreach?.map((o) => o[keyIds.outreach['NOTES']]).join(', ') ?? '',
        }
      })

      const sheetUrl = await exportToSheets({
        batchId: currentStoreBaseRun.parentId as string,
        driveFolderKey,
        data,
      })

      const outputData = outputYupSchema.cast({ data: sheetUrl })
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
