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
    'Number of Photos Uploaded',
    'Number of Photos Received',
    'SF Link',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  const filteredResult = filter(
    result,
    (row: IRow) =>
      row['Case ID'] &&
      row['Case Number'] &&
      row['Triage Name'] &&
      row['Triage Complete'] &&
      row['SF Link']
  ) as ITable

  const users = await getAllGrubhubUsers()

  let errors = ''

  const validResult: ITable = []

  forEach(filteredResult, (result) => {
    forEach(users, (user) => {
      if (user.name === result['Triage Name']?.trim()) {
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
      }
    })
  })

  if (validResult.length !== filteredResult.length) {
    errors = 'Users are missing from the spreadsheet'
  }

  return { validResult, errors }
}

export { importSheet }
