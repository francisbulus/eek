import { assign, fill, forEach, map } from 'lodash'
import { find } from 'lodash/fp'

import { getDBClient } from '../../external/flow'
import { ultron } from '../../external/ultron'
import type { BaseRun, BaseRunVariable, ChildBaseRun } from '../../helpers/types'
import { CALLBACK_BASE_ID, ITEM_KEYS, MATCH_STATUS_MAP, UUIDs } from './constants'

type TCallbackEntry = { header: string; details: string; type: string }

const formatBaseRun = (data: ChildBaseRun) => {
  const result: Record<string, any> = {}
  data.baseRunVariables.forEach((brv) => {
    result[brv.baseVariable.name] = brv.value
    result[`${brv.baseVariable.name} baseRunVariableId`] = brv.id
    result['baseRunId'] = data.id
  })
  return result
}

const getChildBaseRuns = async ({
  parentBaseRunId,
  childBaseId,
}: {
  parentBaseRunId: string
  childBaseId: string
}) => {
  const result = await ultron.baseRun.findChildBaseRuns({
    parentBaseRunId,
    baseId: childBaseId,
  })

  return map(result, formatBaseRun)
}

const groupItemsByMenuHeaders = (data: Record<string, any>[]) => {
  const groupedItems: Record<string, any> = {}

  forEach(data, (record) => {
    if (
      record['Menu Header'] in groupedItems &&
      record['Master Header'] === groupedItems[record['Menu Header']].masterHeader
    )
      return groupedItems[record['Menu Header']].items.push(record)

    groupedItems[record['Menu Header']] = { items: [record] }
    groupedItems[record['Menu Header']].masterHeader = record['Master Header']
  })

  const result = map(Object.keys(groupedItems), (key) => {
    const obj: Record<string, any> = {}
    obj['data'] = groupedItems[key]
    obj['Menu Header'] = key

    return obj
  })

  return result
}

const groupItemsByMasterHeaders = (data: Record<string, any>[]) => {
  const groupedItems: Record<string, any> = {}

  forEach(data, (record) => {
    if (record['Master Header'] in groupedItems)
      return groupedItems[record['Master Header']].items.push(record)

    groupedItems[record['Master Header']] = { items: [record] }
  })

  const result = map(Object.keys(groupedItems), (key) => {
    const obj: Record<string, any> = {}
    obj['data'] = groupedItems[key]
    obj['Master Header'] = key

    return obj
  })

  return result
}

const groupByHeaders = (items: Record<string, any>[]) => {
  return {
    masterHeaders: groupItemsByMasterHeaders(items),
    menuHeaders: groupItemsByMenuHeaders(items),
  }
}

const flagCurrentItems = async (currentItems: Record<string, any>[]) => {
  const result: TCallbackEntry[] = []
  const {
    masterHeaders: currentItemsMasterHeaders,
    menuHeaders: currentItemsMenuHeaders,
  } = groupByHeaders(currentItems)

  // Iterate via all Master Headers

  forEach(currentItemsMasterHeaders, (item) => {
    let itemPricesUnavailable = 0

    forEach(item.data.items, (record) => {
      let itemPrices = 0

      forEach(record['Item Prices'], (price: number) => {
        if (price && price > 0) itemPrices += 1
      })

      if (itemPrices === 0) {
        itemPricesUnavailable += 1
      }
    })

    if (Math.round((itemPricesUnavailable / item.data.items.length) * 100) > 50) {
      result.push({
        header: item['Master Header'],
        details: `${item['Master Header']} has 50% items or more without prices`,
        type: 'Master Header (Item Prices Missing)',
      })
    }
  })

  // Iterate via all Menu Headers

  forEach(currentItemsMenuHeaders, (item) => {
    let itemPricesUnavailable = 0

    forEach(item.data.items, (record) => {
      let itemPrices = 0

      forEach(record['Item Prices'], (price: number) => {
        if (price && price > 0) itemPrices += 1
      })

      if (itemPrices === 0) {
        itemPricesUnavailable += 1
      }
    })

    if (Math.round((itemPricesUnavailable / item.data.items.length) * 100) > 50) {
      result.push({
        header: item['Menu Header'],
        details: `${item['Menu Header']} has 50% items or more without prices`,
        type: 'Menu Header (Item Prices Missing)',
      })
    }
  })

  return result
}

const flagLegacyItems = async (legacyItems: Record<string, any>[]) => {
  const result: TCallbackEntry[] = []
  const {
    masterHeaders: legacyItemsMasterHeaders,
    menuHeaders: legacyItemsMenuHeaders,
  } = groupByHeaders(legacyItems)

  // Iterate via all Master Headers

  forEach(legacyItemsMasterHeaders, (item) => {
    let droppedItems = 0

    forEach(item.data.items, (record) => {
      if (record['Match Status'] === 'Dropped' || record['Match Status'] === 'Incorrectly-Captured')
        droppedItems += 1
    })

    if (Math.round((droppedItems / item.data.items.length) * 100) > 50) {
      result.push({
        header: item['Master Header'],
        details: `${item['Master Header']} has 50% items or more which are not matched`,
        type: 'Master Header (Items Missing)',
      })
    }
  })

  // Iterate via all Menu Headers

  forEach(legacyItemsMenuHeaders, (item) => {
    let droppedItems = 0

    forEach(item.data.items, (record) => {
      if (record['Match Status'] === 'Dropped' || record['Match Status'] === 'Incorrectly-Captured')
        droppedItems += 1
    })

    if (Math.round((droppedItems / item.data.items.length) * 100) > 50) {
      result.push({
        header: item['Menu Header'],
        details: `${item['Menu Header']} has 50% items or more which are not matched`,
        type: 'Menu Header (Items Missing)',
      })
    }
  })

  return result
}

const insertCallbackEntries = async (entries: TCallbackEntry[], parentBaseRunId: string) => {
  if (entries && entries.length > 0) {
    await ultron.baseRun.createMany({
      baseId: CALLBACK_BASE_ID,
      parentBaseRunId,
      initialValuesArray: entries.map((entry) => [
        { baseVariableId: UUIDs.CallbackItemsBase['Detail Name'], value: entry.header },
        { baseVariableId: UUIDs.CallbackItemsBase['Detail Type'], value: entry.type },
        { baseVariableId: UUIDs.CallbackItemsBase['Detail Notes'], value: entry.details },
      ]),
    })
  }
}

const padArray = (arr: any[], length: number, fillVal: any = null) =>
  assign(fill(new Array(length), fillVal), arr)

export const formatItems = (baseRuns: BaseRun[], keyMap: Record<string, string>) =>
  baseRuns.map((baseRun) =>
    baseRun.baseRunVariables.reduce(
      (baseRunObj: Record<string, any>, variable: BaseRunVariable) => {
        if (
          ['Item Prices', 'Item Types', 'Item Sizes'].includes(keyMap[variable?.baseVariableId])
        ) {
          return {
            ...baseRunObj,
            ...padArray(variable?.value, 16).reduce(
              (obj: any, cur: any, index: number) => ({
                ...obj,
                [`${keyMap[variable?.baseVariableId]} ${index + 1}`]: cur,
              }),
              {}
            ),
          }
        }
        return {
          ...baseRunObj,
          ...{ [keyMap[variable?.baseVariableId]]: variable?.value },
        }
      },
      { id: baseRun.id }
    )
  )

const orderBaseVariables = (baseRuns: BaseRun[], ids: string[]) =>
  baseRuns.map((baseRun) => ({
    ...baseRun,
    baseRunVariables: ids.map((id) =>
      find((baseVar: BaseRunVariable) => baseVar.baseVariableId === id, baseRun.baseRunVariables)
    ) as BaseRunVariable[],
  }))

const escapeQuotes = (st: any) => st?.replace(/\'/g, "''")?.replace(/\"/g, '""')

const removePrevPublishing = async (baseRunId: string) => {
  const client = getDBClient()
  await client.connect()
  const sql = `
    WITH remove_mm_publishing AS (
      DELETE FROM ssentialro.mm_v2 WHERE case_id = '${baseRunId}'
    )
    DELETE FROM ssentialro.co_v2 WHERE case_id = '${baseRunId}'
  `
  await client.query(sql)
}

const publishCurrentItems = async ({
  items,
  baseRunId,
  stepRunId,
  restCode,
  chainId,
}: {
  items: any[]
  baseRunId: string
  stepRunId: string
  restCode: string
  chainId?: string
}) => {
  const client = getDBClient()
  await client.connect()

  const currentItems = items.map(
    (item) =>
      `(
      gen_random_uuid(), 
      '${baseRunId}', 
      '${restCode}', 
      '${chainId}', 
      '${item[ITEM_KEYS.masterHeader] ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.masterHeaderDesc]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.menuHeader]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.menuHeaderDesc]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.itemName]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.itemDesc]) ?? ''}', 
      ${item[ITEM_KEYS.itemPrice1] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice2] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice3] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice4] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice5] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice6] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice7] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice8] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice9] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice10] ?? 'null'},
      '${item[ITEM_KEYS.itemType1] ?? ''}',
      '${item[ITEM_KEYS.itemType2] ?? ''}',
      '${item[ITEM_KEYS.itemType3] ?? ''}',
      '${item[ITEM_KEYS.itemType4] ?? ''}',
      '${item[ITEM_KEYS.itemType5] ?? ''}',
      '${item[ITEM_KEYS.itemType6] ?? ''}',
      '${item[ITEM_KEYS.itemType7] ?? ''}',
      '${item[ITEM_KEYS.itemType8] ?? ''}',
      '${item[ITEM_KEYS.itemType9] ?? ''}',
      '${item[ITEM_KEYS.itemType10] ?? ''}',
      '${item[ITEM_KEYS.itemSize1] ?? ''}',
      '${item[ITEM_KEYS.itemSize2] ?? ''}',
      '${item[ITEM_KEYS.itemSize3] ?? ''}',
      '${item[ITEM_KEYS.itemSize4] ?? ''}',
      '${item[ITEM_KEYS.itemSize5] ?? ''}',
      '${item[ITEM_KEYS.itemSize6] ?? ''}',
      '${item[ITEM_KEYS.itemSize7] ?? ''}',
      '${item[ITEM_KEYS.itemSize8] ?? ''}',
      '${item[ITEM_KEYS.itemSize9] ?? ''}',
      '${item[ITEM_KEYS.itemSize10] ?? ''}',
      '${item[ITEM_KEYS.itemImageLink] ?? ''}',
      null,
      '${MATCH_STATUS_MAP[item[ITEM_KEYS.matchStatus]] ?? ''}',
      ${item[ITEM_KEYS.lightAndHealthy] ?? 'false'},
      ${item[ITEM_KEYS.kidsItem] ?? 'false'},
      ${item[ITEM_KEYS.catering] ?? 'false'},
      ${item[ITEM_KEYS.glutenFree] ?? 'false'},
      ${item[ITEM_KEYS.smallPlates] ?? 'false'},
      ${item[ITEM_KEYS.healthyMindful] ?? 'false'},
      ${item[ITEM_KEYS.kosher] ?? 'false'},
      ${item[ITEM_KEYS.vegan] ?? 'false'},
      ${item[ITEM_KEYS.vegetarian] ?? 'false'},
      '${item[ITEM_KEYS.dayPart] ?? ''}',
      '${item[ITEM_KEYS.menuPart] ?? ''}',
      '${item[ITEM_KEYS.itemCode] ?? ''}',
      null,
      '${item[ITEM_KEYS.matchedLegacyItemId] ?? ''}',
      '${item.id}',
      '${stepRunId}',
      NOW(),
      NOW(),
      ${!item[ITEM_KEYS.matchedLegacyItemId] ? null : item[ITEM_KEYS.matchedLegacyItemId]}::bigint
      )`
  )

  const sql = `
    INSERT INTO ssentialro.co_v2 (
      uuid, case_id, restaurant_code, restaurant_chain_id, master_header, master_header_desc, menu_header, menu_header_desc, item_name, item_desc, 
      item_price_1, item_price_2, item_price_3, item_price_4, item_price_5, item_price_6, item_price_7, item_price_8, item_price_9, item_price_10, 
      item_price_1_type, item_price_2_type, item_price_3_type, item_price_4_type, item_price_5_type, item_price_6_type, item_price_7_type, item_price_8_type, item_price_9_type, item_price_10_type, 
      item_price_1_size, item_price_2_size, item_price_3_size, item_price_4_size, item_price_5_size, item_price_6_size, item_price_7_size, item_price_8_size, item_price_9_size, item_price_10_size, 
      item_image_link, source_url, match_status, light_and_healthy, kids_items, catering, gluten_free, small_plates, 
      healthy_mindful, kosher, vegan, vegetarian, day_part, menu_part, item_code,
      match_percentage, matched_mm_id, parent_co_id, publish_log_id, created_at, updated_at, menu_magic_item_id
      )  VALUES 
        ${currentItems.join(',')}
    `
  await client.query(sql)
}

const publishLegacyItems = async ({
  items,
  baseRunId,
  stepRunId,
}: {
  items: any[]
  baseRunId: string
  stepRunId: string
}) => {
  const client = getDBClient()
  await client.connect()

  const legacyItems = items.map(
    (item) => `(
      gen_random_uuid(), 
      '${baseRunId}', 
      '${item[ITEM_KEYS.masterHeader] ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.masterHeaderDesc]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.menuHeader]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.menuHeaderDesc]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.itemName]) ?? ''}', 
      '${escapeQuotes(item[ITEM_KEYS.itemDesc]) ?? ''}', 
      ${item[ITEM_KEYS.itemPrice1] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice2] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice3] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice4] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice5] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice6] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice7] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice8] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice9] ?? 'null'},
      ${item[ITEM_KEYS.itemPrice10] ?? 'null'},
      '${item[ITEM_KEYS.itemType1] ?? ''}',
      '${item[ITEM_KEYS.itemType2] ?? ''}',
      '${item[ITEM_KEYS.itemType3] ?? ''}',
      '${item[ITEM_KEYS.itemType4] ?? ''}',
      '${item[ITEM_KEYS.itemType5] ?? ''}',
      '${item[ITEM_KEYS.itemType6] ?? ''}',
      '${item[ITEM_KEYS.itemType7] ?? ''}',
      '${item[ITEM_KEYS.itemType8] ?? ''}',
      '${item[ITEM_KEYS.itemType9] ?? ''}',
      '${item[ITEM_KEYS.itemType10] ?? ''}',
      '${item[ITEM_KEYS.itemSize1] ?? ''}',
      '${item[ITEM_KEYS.itemSize2] ?? ''}',
      '${item[ITEM_KEYS.itemSize3] ?? ''}',
      '${item[ITEM_KEYS.itemSize4] ?? ''}',
      '${item[ITEM_KEYS.itemSize5] ?? ''}',
      '${item[ITEM_KEYS.itemSize6] ?? ''}',
      '${item[ITEM_KEYS.itemSize7] ?? ''}',
      '${item[ITEM_KEYS.itemSize8] ?? ''}',
      '${item[ITEM_KEYS.itemSize9] ?? ''}',
      '${item[ITEM_KEYS.itemSize10] ?? ''}',
      '${item[ITEM_KEYS.itemImageLink] ?? ''}',
      null,
      '${MATCH_STATUS_MAP[item[ITEM_KEYS.matchStatus]] ?? ''}',
      '${item[ITEM_KEYS.legacyItemId] ?? ''}',
      '${item.id}',
      '${stepRunId}',
      NOW(),
      NOW()
      )`
  )

  const sql = `
    INSERT INTO ssentialro.mm_v2 (
      uuid, case_id, master_header, master_header_desc, menu_header, menu_header_desc, item_name, item_desc, 
      item_price_1, item_price_2, item_price_3, item_price_4, item_price_5, item_price_6, item_price_7, item_price_8, item_price_9, item_price_10, 
      item_price_1_type, item_price_2_type, item_price_3_type, item_price_4_type, item_price_5_type, item_price_6_type, item_price_7_type, item_price_8_type, item_price_9_type, item_price_10_type, 
      item_price_1_size, item_price_2_size, item_price_3_size, item_price_4_size, item_price_5_size, item_price_6_size, item_price_7_size, item_price_8_size, item_price_9_size, item_price_10_size, 
      item_image_link, source_url, match_status, mm_item_id, parent_mm_id, publish_log_id, created_at, updated_at
    ) VALUES 
      ${legacyItems.join(',')}
    
  `
  await client.query(sql)
}

export {
  flagCurrentItems,
  flagLegacyItems,
  formatBaseRun,
  getChildBaseRuns,
  insertCallbackEntries,
  orderBaseVariables,
  publishCurrentItems,
  publishLegacyItems,
  removePrevPublishing,
}
