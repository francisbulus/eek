import logger from '@invisible/logger'

import { ultron } from '../../external/ultron'

type DuplicateCheckConfig = {
  baseVariableID: string
  record_key: string
}

export const findDuplicateRecords = async (
  duplicate_check_config: DuplicateCheckConfig,
  records: any[]
) => {
  const baseVariableID = duplicate_check_config.baseVariableID
  const record_key: string = duplicate_check_config.record_key
  const records_key_value: string[] = []
  const duplicateRecords: any[] = []
  const nonDuplicateRecords: any[] = []
  let duplicateRecordsCount = 0
  let nonDuplicateRecordsCount = 0
  const duplicateDataSet = new Set()

  records.forEach((element) => {
    records_key_value.push(`${(element as any)[record_key]}`)
  })
  const duplicateValues = await ultron.baseRunVariable.duplicateCheck(
    baseVariableID,
    records_key_value
  )

  duplicateValues.forEach((element) => {
    duplicateDataSet.add(element.value)
  })

  records.forEach((element) => {
    const key_value = (element as any)[record_key]
    if (duplicateDataSet.has(key_value)) {
      duplicateRecordsCount = duplicateRecordsCount + 1
      duplicateRecords.push(element)
    } else {
      nonDuplicateRecordsCount = nonDuplicateRecordsCount + 1
      nonDuplicateRecords.push(element)
    }
  })
  logger.debug(`Total Duplicate Records ${duplicateRecordsCount}`)
  logger.debug(`Total Non Duplicate Records ${nonDuplicateRecordsCount}`)
  return [duplicateRecords, duplicateRecordsCount, nonDuplicateRecords, nonDuplicateRecordsCount]
}
