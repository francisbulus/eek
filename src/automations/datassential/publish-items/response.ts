import { keys } from 'lodash/fp'

import {
  CURRENT_ITEM_BASE_ID,
  LEGACY_ITEM_BASE_ID,
  UUIDs,
} from '../../../external/datassential/constants'
import {
  formatItems,
  publishCurrentItems,
  publishLegacyItems,
  removePrevPublishing,
} from '../../../external/datassential/helpers'
import { ultron } from '../../../external/ultron'
import { BusinessInstanceNotFound } from '../../../helpers/errors'

export const publishRestaurantItems = async ({
  baseRunId,
  stepRunId,
  restCode,
}: {
  baseRunId: string
  stepRunId: string
  restCode: string
}): Promise<void> => {
  const currentRestaurant = await ultron.baseRun.findById(baseRunId)

  if (!currentRestaurant)
    throw new BusinessInstanceNotFound({ name: 'baseRun', by: 'id' }, { baseRunId })

  const currentItemBaseRuns = await ultron.baseRun.findMany({
    where: {
      baseId: CURRENT_ITEM_BASE_ID,
      parentId: currentRestaurant.id,
    },
    includeBaseVariableIds: keys(UUIDs.CurrentItem),
  })
  const legacyItemBaseRuns = await ultron.baseRun.findMany({
    where: {
      baseId: LEGACY_ITEM_BASE_ID,
      parentId: currentRestaurant.id,
    },
    includeBaseVariableIds: keys(UUIDs.LegacyItem),
  })

  const chainIdBV = currentRestaurant.baseRunVariables.find(
    (brv) => brv.baseVariableId === UUIDs.Restaurant.ChainId
  )

  await removePrevPublishing(baseRunId)
  const legacyItems = formatItems(legacyItemBaseRuns, UUIDs.LegacyItem)
  await publishLegacyItems({ items: legacyItems, baseRunId, stepRunId })
  const currentItems = formatItems(currentItemBaseRuns, UUIDs.CurrentItem)
  await publishCurrentItems({
    items: currentItems,
    baseRunId,
    stepRunId,
    restCode,
    chainId: chainIdBV?.value,
  })
}
