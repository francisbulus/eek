import { NowRequest, NowResponse } from '@vercel/node'
import { compact, flow, includes, map, uniq } from 'lodash/fp'
import { phone } from 'phone'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { BaseRun } from '../../../helpers/types'
import { getBaseRunVariableValue } from '../../../helpers/ultron/baseRun'
import { validateBasics } from '../../../helpers/yup'
import type { TAddGroupKeyFn } from '../helpers'
import {
  buildBaseRunGroupsBy,
  deduplicateBy,
  getCurrentAndRecentLeads,
  markAllDuplicatesInGroups,
} from '../helpers'
import { DUPLICATE_BASE_VARIABLE_ID, PHONE_BASE_VARIABLE_ID } from '../helpers/constants'

/**
 *  Get all the Leads baseRun variables: Contact Phone;
 *  Normalize the phone numbers in an array of phone numbers
 * ['+1234567', '+4567891']
 */
const getAggregatedPhoneNumbers = (leads: BaseRun[]) =>
  flow(
    map((lead: BaseRun) =>
      getBaseRunVariableValue({ baseVariableId: PHONE_BASE_VARIABLE_ID, baseRun: lead })
    ),
    map((phoneNumber?: string) =>
      phoneNumber
        ? phone(phoneNumber)?.phoneNumber
          ? (phone(phoneNumber).phoneNumber as string)
          : undefined
        : undefined
    ),
    compact,
    uniq
  )(leads)

const isDuplicateByPhone = (aggregatedPhoneNumbers: string[]) => (baseRun: BaseRun): boolean => {
  const phoneNumber = phone(
    getBaseRunVariableValue({ baseRun, baseVariableId: PHONE_BASE_VARIABLE_ID })
  )?.phoneNumber
  return Boolean(phoneNumber && includes(phoneNumber, aggregatedPhoneNumbers))
}

const addPhoneGroupKey: TAddGroupKeyFn = (baseRun: BaseRun) => {
  const rawPhone = getBaseRunVariableValue({ baseRun, baseVariableId: PHONE_BASE_VARIABLE_ID })
  const groupKey = rawPhone ? phone(rawPhone).phoneNumber : undefined
  return groupKey
    ? {
        baseRun,
        groupKey,
      }
    : undefined
}

const buildBaseRunGroupsByPhone = buildBaseRunGroupsBy(addPhoneGroupKey)

const deduplicateLeadsByPhone = async ({
  baseRunsToDeduplicate,
  aggregatedPhoneNumbers,
}: {
  baseRunsToDeduplicate: BaseRun[]
  aggregatedPhoneNumbers: string[]
}): Promise<void> => {
  // Group all Leads by normalized Contact Phone
  const baseRunGroups = buildBaseRunGroupsByPhone(baseRunsToDeduplicate)
  const nonDuplicatedLeadsCurrentBatch = await markAllDuplicatesInGroups(baseRunGroups)
  const isDuplicateFn = isDuplicateByPhone(aggregatedPhoneNumbers)
  await deduplicateBy({
    baseRuns: nonDuplicatedLeadsCurrentBatch,
    isDuplicateFn,
  })
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const { stepRunId } = validateBasics(req)

    // For phone numbers, we deduplicate the current batch and the prior 30 days
    const { current, recent } = await getCurrentAndRecentLeads({
      stepRunId: stepRunId as string,
      includeBaseVariableIds: [PHONE_BASE_VARIABLE_ID, DUPLICATE_BASE_VARIABLE_ID],
    })

    const aggregatedPhoneNumbers = getAggregatedPhoneNumbers(recent)

    await deduplicateLeadsByPhone({
      baseRunsToDeduplicate: current,
      aggregatedPhoneNumbers,
    })

    res.send({
      stepRunId,
      data: {},
      status: STEP_RUN_STATUSES.DONE,
    })
  } catch (err: any) {
    handleError({ err, req, res })
  }
}

export {
  addPhoneGroupKey,
  buildBaseRunGroupsByPhone,
  deduplicateLeadsByPhone,
  getAggregatedPhoneNumbers,
  isDuplicateByPhone,
}
