import { NowRequest, NowResponse } from '@vercel/node'
import { parseAddress } from 'addresser'
import { compact, flow, isEmpty, kebabCase, map, uniq } from 'lodash/fp'

import { STEP_RUN_STATUSES } from '../../../constants'
import { handleError } from '../../../helpers/errors'
import { BaseRun } from '../../../helpers/types'
import { getBaseRunVariableValue } from '../../../helpers/ultron/baseRun'
import { validateBasics } from '../../../helpers/yup'
import type { TAddGroupKeyFn } from '../helpers'
import { buildBaseRunGroupsBy, getCurrentLeads, markAllDuplicatesInGroups } from '../helpers'
import { ADDRESS_BASE_VARIABLE_ID, DUPLICATE_BASE_VARIABLE_ID } from '../helpers/constants'

const safeParseAddress = (address?: string) => {
  if (isEmpty(address) || !address) return undefined
  try {
    const { id } = parseAddress(address)
    return id
  } catch (err: any) {
    return kebabCase(address)
  }
}

/**
 *  Get all the Leads baseRun variables: Property Address;
 *  Normalize the addresses in an array of addresses
 * ['400-South-Ave,-South,-NJ-07079', '400-North-Ave,-North,-NJ-07090']
 */
const getAggregatedAddresses = (leads: BaseRun[]) =>
  flow(
    map((lead: BaseRun) =>
      getBaseRunVariableValue({ baseVariableId: ADDRESS_BASE_VARIABLE_ID, baseRun: lead })
    ),
    map(safeParseAddress),
    compact,
    uniq
  )(leads)

const addAddressGroupKey: TAddGroupKeyFn = (baseRun: BaseRun) => {
  const rawAddress: string | undefined = getBaseRunVariableValue({
    baseVariableId: ADDRESS_BASE_VARIABLE_ID,
    baseRun,
  })
  return rawAddress && safeParseAddress(rawAddress)
    ? {
        baseRun,
        groupKey: safeParseAddress(rawAddress) as string,
      }
    : undefined
}

const buildBaseRunGroupsByAddress = buildBaseRunGroupsBy(addAddressGroupKey)

const deduplicateLeadsByAddress = async (baseRunsToDeduplicate: BaseRun[]): Promise<void> => {
  // Group all Leads by normalized Property Address
  const baseRunGroups = buildBaseRunGroupsByAddress(baseRunsToDeduplicate)

  // For addresses, we only care about the current batch and not the prior 30 days
  await markAllDuplicatesInGroups(baseRunGroups)
}

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    const { stepRunId } = validateBasics(req)

    // For addresses, we only care about the current batch and not the prior 30 days
    const current = await getCurrentLeads({
      stepRunId: stepRunId as string,
      includeBaseVariableIds: [ADDRESS_BASE_VARIABLE_ID, DUPLICATE_BASE_VARIABLE_ID],
    })

    await deduplicateLeadsByAddress(current)

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
  addAddressGroupKey,
  buildBaseRunGroupsByAddress,
  deduplicateLeadsByAddress,
  getAggregatedAddresses,
}
