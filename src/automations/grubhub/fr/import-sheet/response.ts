import logger from '@invisible/logger'
import { filter, forEach } from 'lodash'
import { map } from 'lodash/fp'
import pMap from 'p-map'
import { UUIDs } from 'src/external/grubhub/constants'

import {
  fetchExistingBaseRunsValues,
  getAllGrubhubUsers,
} from '../../../../external/grubhub/helpers'
import { IRow, ITable } from '../../../../helpers/arrays'
import { getSheetData, getSheets, getSpreadsheetId } from '../../../../helpers/google/sheets'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'

const getAccountName = async (connection: any, id: string) => {
  const goLivePayload = (await connection
    .sobject('Go_Live__c')
    .findOne()
    .select('Id, Account__c, Name')
    .where(`Id = '${id}'`)
    .execute()) as any
  if (!goLivePayload) return null
  const accountPayload = (await connection
    .sobject('Account')
    .findOne()
    .select('Id, CustID__c, Name')
    .where(`Id = '${goLivePayload.Account__c}'`)
    .execute()) as any

  return accountPayload.Name
}

async function importSheet({
  sheetUrl,
  frBaseId,
  frCompleteBaseId,
}: {
  sheetUrl: string
  frBaseId: string
  frCompleteBaseId: string
}) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const tabNames = [
    'Pilot-Work',
    'Commissary- Work',
    'Enterprise Copy-Work',
    'Enterprise POS- Work',
    'Grubhub 8-Work',
    'Final Reviews-Completed',
  ]

  const columns = [
    'Go Live: ID',
    'Go Live: Owner Name',
    'Menu Copy Cust Id',
    'Go Live: Go Live Name',
    'Address Copy',
    'Final Review Type',
    'GH Menu Mate',
    'GH Entry Method',
    'Menu Item Count',
    'SF Link',
    'Queue',
  ]

  const columnsAuto = columns.concat(['Final Review Rep Name', 'Final Review Complete'])

  const spreadsheetData = await getSheets({ spreadsheetId })

  const sheetTabs = map(
    ({ properties }) => properties?.title,
    spreadsheetData?.filter(
      ({ properties }) => properties?.title && tabNames.includes(properties.title)
    )
  ) as string[]

  const connection = await establishSFDCConnection('grubhub')

  const existingFR = await fetchExistingBaseRunsValues({
    baseId: frBaseId,
    baseVariableIds: [UUIDs.BaseVariables.FRGoLiveId],
  })

  const existingFRComplete = await fetchExistingBaseRunsValues({
    baseId: frCompleteBaseId,
    baseVariableIds: [UUIDs.BaseVariables.FRCompleteGoLiveId],
  })

  const result: ITable = []
  let errors = ''
  const autoCompleteResult: ITable = []

  await pMap(
    sheetTabs,
    async (tab) => {
      logger.info(`Grubhub FR - Sheet Tab: ${tab}`)
      const records = (await getSheetData({
        spreadsheetId,
        tabName: tab,
        columns: tab === 'Final Reviews-Completed' ? columnsAuto : columns,
      })) as ITable

      if (tab === 'Final Reviews-Completed' && records.length > 0) {
        const filteredResult = filter(
          records,
          (row: IRow) => row['Final Review Complete'] && row['Final Review Rep Name']
        ) as ITable

        const users = await getAllGrubhubUsers()

        const validResult: ITable = []

        await pMap(
          filteredResult,
          async (result: IRow) => {
            const exists = existingFR.includes(result['Go Live: ID'] as string)
            const existsInComplete = existingFRComplete.includes(result['Go Live: ID'] as string)

            if (!exists && !existsInComplete) {
              const accountName = await getAccountName(connection, result['Go Live: ID'] as string)
              if (!accountName) return

              forEach(users, (user) => {
                if (user.name === result['Final Review Rep Name']?.trim()) {
                  validResult.push({
                    ...result,
                    'Final Review Rep Name': user.email,
                    'Final Review Complete': new Date(
                      result['Final Review Complete'] as string
                    ).toUTCString(),
                  })

                  autoCompleteResult.push({
                    ...result,
                    'Final Review Rep Name': user.email,
                    'Final Review Complete': new Date(
                      result['Final Review Complete'] as string
                    ).toUTCString(),
                    pType: 'Final Reviews - Complete',
                    'Account Name': accountName,
                  })
                }
              })
            }
          },
          { concurrency: 1 }
        )

        if (validResult.length !== filteredResult.length)
          errors = 'Some rows have not been imported because of missing users'

        logger.info(`Grubhub FR - FR Complete Case Count: ${validResult.length}`)
      } else {
        await pMap(
          records,
          async (record: IRow) => {
            const exists = existingFR.includes(record['Go Live: ID'] as string)

            if (!exists) {
              const accountName = await getAccountName(connection, record['Go Live: ID'] as string)
              if (!accountName) return

              result.push({
                ...record,
                pType: 'Final Reviews',
                'Account Name': accountName,
              })
            }
          },
          { concurrency: 1 }
        )
        logger.info(`Grubhub FR - FR - Case Count: ${records.length}`)
      }
    },
    { concurrency: 1 }
  )

  return { result, autoCompleteResult, errors }
}

export { importSheet }
