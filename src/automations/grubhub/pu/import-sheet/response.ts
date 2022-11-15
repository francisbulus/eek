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
    'Rep Name',
    'Case Work Start 1',
    'Case Work Stop 1',
    'Case Work Start 2',
    'Case Work Stop 2',
    'Case Work Complete Time',
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
      row['Rep Name'] &&
      row['Case Work Complete Time'] &&
      row['SF Link']
  ) as ITable

  const users = await getAllGrubhubUsers()

  let errors = ''

  const validResult: ITable = []

  forEach(filteredResult, (result) => {
    forEach(users, (user) => {
      if (user.name === result['Rep Name']?.trim()) {
        validResult.push({
          ...result,
          'Rep Name': user.email,
          'Case Work Complete Time': new Date(
            result['Case Work Complete Time'] as string
          ).toUTCString(),
          'Case Work Start 1':
            result['Case Work Start 1'] &&
            new Date(result['Case Work Start 1'] as string).toUTCString(),
          'Case Work Stop 1':
            result['Case Work Stop 1'] &&
            new Date(result['Case Work Stop 1'] as string).toUTCString(),
          'Case Work Start 2':
            result['Case Work Start 2'] &&
            new Date(result['Case Work Start 2'] as string).toUTCString(),
          'Case Work Stop 2':
            result['Case Work Stop 2'] &&
            new Date(result['Case Work Stop 2'] as string).toUTCString(),
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
