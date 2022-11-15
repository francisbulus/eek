import { filter, forEach } from 'lodash'

import { getAllGrubhubUsers } from '../../../../external/grubhub/helpers'
import { IRow, ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({ sheetUrl, sheetTab }: { sheetUrl: string; sheetTab: string }) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'Case ID',
    'Case Number',
    'Case Owner',
    'Cust ID',
    'Restaurant Name',
    'Address',
    'Subject',
    'Update Type',
    'Triage Name',
    'Triage Start Time 1',
    'Triage Stop Time 1',
    'Triage Start Time 2',
    'Triage Stop Time 2',
    'Triage Complete',
    'SF Link',
    'Project/Tracker',

    // MUT Responses columns
    'Account Name',
    'Package Status',
    'Status',
    'Enterprise',
    'Menu Item Count',
    'Operator',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  let filteredResult = filter(
    result,
    (row: IRow) => row['Case ID'] && row['Case Number'] && row['Triage Complete'] && row['SF Link']
  ) as ITable

  if (sheetTab === 'MUT Responses') {
    filteredResult = filter(filteredResult, (row: IRow) => row['Operator']) as ITable
  } else {
    filteredResult = filter(filteredResult, (row: IRow) => row['Triage Name']) as ITable
  }

  const users = await getAllGrubhubUsers()

  let errors = ''

  const validResult: ITable = []

  forEach(filteredResult, (result) => {
    forEach(users, (user) => {
      if (sheetTab === 'MUT Responses' && user.name === result['Operator']?.trim())
        validResult.push({
          ...result,
          Operator: user.email,
          'Triage Complete': new Date(result['Triage Complete'] as string).toUTCString(),
        })

      if (sheetTab !== 'MUT Responses' && user.name === result['Triage Name']?.trim())
        validResult.push({
          ...result,
          'Triage Name': user.email,
          'Triage Complete': new Date(result['Triage Complete'] as string).toUTCString(),
          'Triage Start Time 1':
            result['Triage Start Time 1'] &&
            new Date(result['Triage Start Time 1'] as string).toUTCString(),
          'Triage Stop Time 1':
            result['Triage Stop Time 1'] &&
            new Date(result['Triage Stop Time 1'] as string).toUTCString(),
          'Triage Start Time 2':
            result['Triage Start Time 2'] &&
            new Date(result['Triage Start Time 2'] as string).toUTCString(),
          'Triage Stop Time 2':
            result['Triage Stop Time 2'] &&
            new Date(result['Triage Stop Time 2'] as string).toUTCString(),
        })
    })
  })

  if (validResult.length !== filteredResult.length)
    errors = 'Some rows have not been imported because of missing users'

  return { validResult, errors }
}

export { importSheet }
