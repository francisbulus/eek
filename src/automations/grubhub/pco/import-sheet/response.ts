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
    'Account Name',
    'Restaurant Name',
    'Address',
    'Date/Time Opened',
    'Subject',
    'Assignee',
    'SF Link',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  const filteredResult = filter(
    result,
    (row: IRow) =>
      row['Case ID'] &&
      row['Case Number'] &&
      row['Date/Time Opened'] &&
      row['Assignee'] &&
      row['SF Link']
  ) as ITable

  const users = await getAllGrubhubUsers()

  let errors = ''

  const validResult: ITable = []

  forEach(filteredResult, (result) => {
    forEach(users, (user) => {
      if (user.name === result['Assignee']?.trim()) {
        validResult.push({
          ...result,
          Assignee: user.email,
          'Date/Time Opened': new Date(result['Date/Time Opened'] as string).toUTCString(),
        })
      }
    })
  })

  if (validResult.length !== filteredResult.length)
    errors = 'Some rows have not been imported because of missing users'

  return { validResult, errors }
}

export { importSheet }
