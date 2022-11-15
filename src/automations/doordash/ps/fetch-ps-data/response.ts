import { createFolderInFolder } from 'src/helpers/google/drive'

import { ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

async function importSheet({
  sheetUrl,
  sheetTab,
  batchDate,
  driveFolderKey,
}: {
  sheetUrl: string
  sheetTab: string
  batchDate: string
  driveFolderKey: string
}) {
  const spreadsheetId = getSpreadsheetId(sheetUrl)

  const columns = [
    'Business ID',
    'Store ID',
    'Business Name',
    'Management Type',
    'Vendor Action',
    'Header Needed',
    'Logo Needed',
    'Item Photos Needed',
    'Country Name',
    'Address_1',
    'Address_2',
    'Address_3',
    'DIME Link',
    'Nr of Dime Items',
    'Nr of Dime Items With Description',
  ]

  const result = (await getSheetData({ spreadsheetId, tabName: sheetTab, columns })) as ITable

  if (result.length <= 0) return []

  const folderName = (await createFolderInFolder({
    folderId: driveFolderKey,
    folderName: `Batch - ${batchDate}`,
  })) as string

  return result.map((row) => ({
    ...row,
    'DIME Link': row['DIME Link']
      ? row['DIME Link']
      : `https://menu-editor.doordash.com/dime/editor/${row['Business ID']}`,
    'Mint URL': `https://admin-gateway.doordash.com/mx-tools/store/${row['Store ID']}`,
    'Upload URL': `https://drive.google.com/drive/u/1/folders/${folderName}`,
    'Mx/Google': `https://google.com/search?q=${encodeURIComponent(
      row['Business Name'] + " Mx's Website"
    )}`,
    Facebook: `https://google.com/search?q=${encodeURIComponent(
      row['Business Name'] + ' facebook'
    )}`,
    Yelp: `https://google.com/search?q=${encodeURIComponent(
      'site:yelp.com ' + row['Business Name']
    )}`,
    Instagram: `https://google.com/search?q=${encodeURIComponent(
      row['Business Name'] + 'Instagram'
    )}`,
    OpenTable: `https://google.com/search?q=${encodeURIComponent(
      'site:opentable.com ' + row['Business Name']
    )}`,
    TripAdvisor: `https://google.com/search?q=${encodeURIComponent(
      'site:tripadvisor.com ' + row['Business Name']
    )}`,
    Zagat: `https://google.com/search?q=${encodeURIComponent(
      'site:zagat.com ' + row['Business Name']
    )}`,
    Zomato: `https://google.com/search?q=${encodeURIComponent(
      'site:zomato.com ' + row['Business Name']
    )}
    `,
  }))
}

export { importSheet }
