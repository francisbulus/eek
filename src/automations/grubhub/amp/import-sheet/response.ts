import { filter, forEach } from 'lodash'

import { getAllGrubhubUsers } from '../../../../external/grubhub/helpers'
import { IRow, ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({ sheetUrl, sheetTab }: { sheetUrl: string; sheetTab: string }) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'Case ID',
    'Date/Time Closed',
    'Case Owner',
    'Subject',
    'Age',
    'Case Work Process Time',
    'Rep Name',
    'SF Link',
  ]

  const result = await getSheetData({ spreadsheetId, tabName: sheetTab, columns })

  const filteredResult = filter(
    result,
    (row: IRow) => row['Date/Time Closed'] && row['Rep Name']
  ) as ITable

  const users = await getAllGrubhubUsers()

  let errors = ''

  const validResult: ITable = []

  forEach(filteredResult, (result) => {
    forEach(users, (user) => {
      if (user.name === result['Rep Name']?.trim())
        validResult.push({
          ...result,
          'Rep Name': user.email,
          'Date/Time Closed': new Date(result['Date/Time Closed'] as string).toUTCString(),
        })
    })
  })

  if (validResult.length !== filteredResult.length)
    errors = 'Some rows have not been imported because of missing users'

  return { validResult, errors }
}

export { importSheet }
