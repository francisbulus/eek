import logger from '@invisible/logger'
import { map } from 'lodash/fp'
import pMap from 'p-map'

import { UUIDs } from '../../../../external/grubhub/constants'
import { fetchExistingBaseRunsValues } from '../../../../external/grubhub/helpers'
import { IRow, ITable } from '../../../../helpers/arrays'
import { getSheetData, getSheets, getSpreadsheetId } from '../../../../helpers/google/sheets'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'

async function importSheet({ sheetUrl, baseId }: { sheetUrl: string; baseId: string }) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const tabNames = ['Sheet1']

  const columns = [
    'Go Live: ID',
    'Cust_id_copy',
    'Go Live: Go Live Name',
    'Menu Item Count',
    'GH Entry Complete',
    'GH Package Status',
    'GH Menu Mate',
    'Menu Copy',
    'Final Review Rep Name',
    'Final Review Complete',
    'Final Review Type',
    'SF Link',
    'FR Type',
  ]

  const spreadsheetData = await getSheets({ spreadsheetId })

  const sheetTabs = map(
    ({ properties }) => properties?.title,
    spreadsheetData?.filter(
      ({ properties }) => properties?.title && tabNames.includes(properties.title)
    )
  ) as string[]

  const connection = await establishSFDCConnection('grubhub')

  const result: ITable = []

  const existing = await fetchExistingBaseRunsValues({
    baseId,
    baseVariableIds: [UUIDs.BaseVariables.FRQAGoLiveId],
  })

  await pMap(
    sheetTabs,
    async (tab) => {
      const records = (await getSheetData({
        spreadsheetId,
        tabName: tab,
        columns,
      })) as ITable
      await pMap(
        records,
        async (record: IRow) => {
          const exists = existing.includes(record['Go Live: ID'] as string)

          if (!exists) {
            const goLivePayload = (await connection
              .sobject('Go_Live__c')
              .findOne()
              .select('Id, Account__c, Name')
              .where(`Id = '${record['Go Live: ID']}'`)
              .execute()) as any

            if (!goLivePayload) return

            const accountPayload = (await connection
              .sobject('Account')
              .findOne()
              .select('Id, CustID__c, Name')
              .where(`Id = '${goLivePayload.Account__c}'`)
              .execute()) as any

            result.push({
              'Go Live ID': record['Go Live: ID'],
              'Cust ID': record['Cust_id_copy'],
              'Account Name': accountPayload?.Name ?? '',
              'Go Live Name': record['Go Live: Go Live Name'],
              'Menu Item Count': record['Menu Item Count'],
              'GH Entry Complete': record['GH Entry Complete'],
              'GH Package Status': record['GH Package Status'],
              'GH Menu Mate': record['GH Menu Mate'],
              'Menu Copy': record['Menu Copy'],
              'Final Review Rep Name': record['Final Review Rep Name'],
              'Final Review Complete': new Date(
                record['Final Review Complete'] as string
              ).toUTCString(),
              'Final Review Type': record['Final Review Type'],
              'Case URL': record['SF Link'],
              Queue: record['FR Type'],
            })
          }
        },
        { concurrency: 1 }
      )
    },
    { concurrency: 1 }
  )

  logger.debug(`Grubhub FRQA - Case Count: ${result.length}`)
  return result
}

export { importSheet }
