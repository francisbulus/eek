import { map } from 'lodash'
import pMap from 'p-map'
import { compareTwoStrings } from 'string-similarity'

import { ISheetValueRow } from '../../../helpers/arrays'
import type {
  BaseRun,
  BaseRunVariableUpdateManyInputArgs,
  ChildBaseRun,
} from '../../../helpers/types'
import { ultron } from '../../ultron'
import { EXPORT_SHEET_FIELDS, UUIDs } from './constants'
import type { Competitor } from './types'

const formatBaseRun = (data: ChildBaseRun) => {
  const result: Record<string, any> = {}
  data.baseRunVariables.forEach((brv) => {
    result[brv.baseVariable.name] = brv.value
  })
  result['baseRunId'] = data.id
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

const getSheetRowsForBoltRMPExport = async (result: Record<string, any>[]) => {
  const sheetValues: ISheetValueRow[] = []

  result.forEach((item: any) => {
    const row: ISheetValueRow = []

    EXPORT_SHEET_FIELDS.forEach((field) => {
      row.push(item[field])
    })

    sheetValues.push(row)
  })

  return sheetValues
}

const checkIfScrappedInfoMatches = async ({
  restaurantName,
  address,
  receivedName,
  receivedAddress,
}: {
  restaurantName: string
  address: string
  receivedName: string
  receivedAddress: string
}) => {
  let match = false

  const nameMatchingPercentage =
    compareTwoStrings(restaurantName.toLowerCase(), receivedName.toLowerCase()) * 100

  const addressMatchingPercentage =
    compareTwoStrings(address.toLowerCase(), receivedAddress.toLowerCase()) * 100

  if (((nameMatchingPercentage + addressMatchingPercentage) / 200) * 100 >= 60) match = true

  return match
}

const updateRestaurantValues = async (
  values: {
    restaurantName?: string | null
    address?: string | null
    restaurantStatus?: string | null
    rating?: number | null
    scrapped?: boolean | null
    matches?: boolean | null
  },
  competitor: Competitor,
  baseRun: BaseRun
) => {
  const updateArgs: BaseRunVariableUpdateManyInputArgs[] = []

  await pMap(
    Object.keys(values),
    async (key) => {
      switch (key) {
        case 'restaurantName':
          updateArgs.push({
            baseRunId: baseRun.id,
            baseVariableId: UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Name`],
            baseRunVariableId: baseRun.baseRunVariables.find(
              (brv) =>
                brv.baseVariableId ===
                UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Name`]
            )?.id as string,
            value: values.restaurantName,
          })

          break

        case 'address':
          updateArgs.push({
            baseRunId: baseRun.id,
            baseVariableId: UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Address`],
            baseRunVariableId: baseRun.baseRunVariables.find(
              (brv) =>
                brv.baseVariableId ===
                UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Address`]
            )?.id as string,
            value: values.address,
          })

          break

        case 'restaurantStatus':
          updateArgs.push({
            baseRunId: baseRun.id,
            baseVariableId: UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Status`],
            baseRunVariableId: baseRun.baseRunVariables.find(
              (brv) =>
                brv.baseVariableId ===
                UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Status`]
            )?.id as string,
            value: values.restaurantStatus,
          })

          break

        case 'rating':
          updateArgs.push({
            baseRunId: baseRun.id,
            baseVariableId: UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Rating`],
            baseRunVariableId: baseRun.baseRunVariables.find(
              (brv) =>
                brv.baseVariableId ===
                UUIDs.BaseVariables.Restaurant[`${competitor} Restaurant Rating`]
            )?.id as string,
            value: values.rating,
          })

          break

        case 'scrapped':
          updateArgs.push({
            baseRunId: baseRun.id,
            baseVariableId: UUIDs.BaseVariables.Restaurant.Scrapped,
            baseRunVariableId: baseRun.baseRunVariables.find(
              (brv) => brv.baseVariableId === UUIDs.BaseVariables.Restaurant.Scrapped
            )?.id as string,
            value: values.scrapped,
          })

          break

        case 'matches':
          updateArgs.push({
            baseRunId: baseRun.id,
            baseVariableId: UUIDs.BaseVariables.Restaurant['Information Matches'],
            baseRunVariableId: baseRun.baseRunVariables.find(
              (brv) => brv.baseVariableId === UUIDs.BaseVariables.Restaurant['Information Matches']
            )?.id as string,
            value: values.matches,
          })

          break

        default:
          break
      }
    },
    { concurrency: 1, stopOnError: false }
  )

  await ultron.baseRunVariable.updateMany(updateArgs)
}

export {
  checkIfScrappedInfoMatches,
  formatBaseRun,
  getChildBaseRuns,
  getSheetRowsForBoltRMPExport,
  updateRestaurantValues,
}
