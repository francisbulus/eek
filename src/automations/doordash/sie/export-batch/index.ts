import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { NowRequest, NowResponse } from '@vercel/node'
import { values } from 'lodash/fp'
import * as yup from 'yup'

import { STEP_RUN_STATUSES } from '../../../../constants'
import {
  GDRIVE_EXPORT_FOLDER_ID,
  STORES_BASE_ID,
  UUIDs,
} from '../../../../external/doordash/sie/constants'
import { ultron } from '../../../../external/ultron'
import { BusinessInstanceNotFound, handleError } from '../../../../helpers/errors'
import { validateBasics } from '../../../../helpers/yup'
import { exportToSheets } from './response'

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

      if (!stepRun) throw new BusinessInstanceNotFound({ name: 'stepRun', by: 'id' }, { stepRunId })

      const allBatchOutreach = await ultron.baseRun.findMany({
        where: {
          parent: {
            parent: {
              id: stepRun.baseRunId,
            },
          },
        },
        includeBaseVariableIds: values(UUIDs.Outreach),
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

      logger.info(`Parent BaseRun ID - ${stepRun.baseRunId}`)
      const stores = await ultron.baseRun.findChildBaseRuns({
        parentBaseRunId: stepRun.baseRunId,
        baseId: STORES_BASE_ID,
      })
      const data = stores.map((store, index) => {
        const getValue = (baseVariableId: string, variables: any[]) =>
          variables.find((v) => v.baseVariable.id === baseVariableId)?.value
        const outreach = storeOutreachMap[store.id]
        const lastIndex = outreach?.length - 1
        return {
          ID: getValue(UUIDs.Stores['Store ID'], store.baseRunVariables),
          'COMPANY NAME': getValue(UUIDs.Stores['Company Name'], store.baseRunVariables),
          STREET: getValue(UUIDs.Stores['Street'], store.baseRunVariables),
          CITY: getValue(UUIDs.Stores['City'], store.baseRunVariables),
          STATE: getValue(UUIDs.Stores['State'], store.baseRunVariables),
          ZIP_CODE: getValue(UUIDs.Stores['Zip Code'], store.baseRunVariables),
          COUNTRY: getValue(UUIDs.Stores['Country'], store.baseRunVariables),
          PHONE: getValue(UUIDs.Stores['Phone Nr'], store.baseRunVariables),
          GOOGLE_LINK: getValue(UUIDs.Stores['Google Link'], store.baseRunVariables),
          '# of Attempt': getValue(UUIDs.Stores['Outreach Count'], store.baseRunVariables),
          'IS MERCHANT NAME MATCHING?':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Name Matching']] ?? '',
          'IS PHONE NUMBER VALID?': outreach?.[lastIndex]?.[UUIDs.Outreach['Phone Nr Valid']] ?? '',
          'IF NOT VALID, WHAT IS THE CORRECT PHONE NUMBER?':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Correct Phone Number']] ?? '', // Use contact from last outreach
          'PERM CLOSED?': outreach?.[lastIndex]?.[UUIDs.Outreach['Permanently Closed']] ?? '',
          'PERM CLOSED SOURCE':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Permanently Closed Source']] ?? '',
          'IF PERM CLOSED SOURCE = OTHER, PLEASE SPECIFY SOURCE':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Other Permanently Closed Source']] ?? '',
          'WHAT TYPE OF ESTABLISHMENT IS THIS?':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Type Of Establishment']] ?? '',
          'IF ESTABLISHMENT = OTHER, PLEASE SPECIFY':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Other Type Of Establishment']] ?? '',
          '"Notes(Please mark as ""DONE"" if no further action is required)"':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Notes']] ?? '',
          'Agent(or Agent Email)': outreach?.[lastIndex]?.[UUIDs.Outreach['Agent Email']] ?? '',
          Connected: outreach?.[lastIndex]?.[UUIDs.Outreach['Connected']] ?? '',
          'Call Outcome': outreach?.[lastIndex]?.[UUIDs.Outreach['Call Outcome']] ?? '',
          'Contact Nr Used': outreach?.[lastIndex]?.[UUIDs.Outreach['Contact Nr Used']] ?? '',
          'Completion Date': outreach?.[lastIndex]?.[UUIDs.Outreach['Completion Date']] ?? '',
          'Unsuccessful Reason':
            outreach?.[lastIndex]?.[UUIDs.Outreach['Unsuccessful Reason']] ?? '',
        }
      })

      logger.info(`Result Count - ${data.length}`)

      const sheetUrl = await exportToSheets({
        batchId: stepRun.baseRunId,
        driveFolderKey: GDRIVE_EXPORT_FOLDER_ID,
        data,
      })
      logger.info(`Sheet Url - ${sheetUrl}`)

      const outputData = outputYupSchema.cast({ data: sheetUrl })
      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      logger.info(`Error - ${err}`)
      handleError({ err, req, res })
    }
  })
}
