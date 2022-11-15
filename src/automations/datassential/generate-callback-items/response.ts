import {
  flagCurrentItems,
  flagLegacyItems,
  getChildBaseRuns,
  insertCallbackEntries,
} from '../../../external/datassential'

const generateCallbackItems = async ({
  parentBaseId,
  currentItemsBaseId,
  legacyItemsBaseId,
}: {
  parentBaseId: string
  currentItemsBaseId: string
  legacyItemsBaseId: string
}) => {
  const [currentItems, legacyItems] = await Promise.all([
    await getChildBaseRuns({ parentBaseRunId: parentBaseId, childBaseId: currentItemsBaseId }),

    await getChildBaseRuns({ parentBaseRunId: parentBaseId, childBaseId: legacyItemsBaseId }),
    ,
  ])

  const flaggedItems = await Promise.all([
    await flagCurrentItems(currentItems),
    await flagLegacyItems(legacyItems),
  ])

  await Promise.all(
    flaggedItems.map(async (items) => await insertCallbackEntries(items, parentBaseId))
  )
}

export { generateCallbackItems }
