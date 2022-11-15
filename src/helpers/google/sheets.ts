import { sheets_v4 } from 'googleapis'
import { isString, upperCase } from 'lodash'
import { find, isEmpty, map, pick, split, tail } from 'lodash/fp'

import { google, init } from '../../config/google'
import {
  ISheetValue,
  ISheetValueRow,
  isTable,
  ITable,
  unzipArrayOfObjects,
  zipArrayOfArraysToObjects,
} from '../arrays'
import { ValueRenderOption } from '../types'
import { _TAB_COLORS, convertColor, TTabColor } from './constants'

const sheets = google.sheets('v4')

/**
 * Creates a new Google Document with the given title
 */
const createSpreadsheet = async ({ title }: { title: string }) => {
  await init()

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title,
      },
    },
  })
  return response?.data?.spreadsheetId
}

const formatHeader = async ({
  spreadsheetId,
  tabName,
}: {
  spreadsheetId: string
  tabName: string
}) => {
  await init()

  const sheetId = await getTabIdByName({ spreadsheetId, tabName })

  const range = {
    sheetId,
    endRowIndex: 1,
  }

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
        {
          repeatCell: {
            range,
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: convertColor(217),
                  green: convertColor(217),
                  blue: convertColor(217),
                },
                textFormat: {
                  bold: true,
                  foregroundColor: {
                    red: 0.0,
                    green: 0.0,
                    blue: 0.0,
                  },
                },
                horizontalAlignment: 'LEFT',
              },
            },
            fields:
              'userEnteredFormat(backgroundColor,textFormat.bold,textFormat.foregroundColor,horizontalAlignment)',
          },
        },
      ],
    },
  })

  await convertToUpperCase({
    spreadsheetId,
    tabName,
    range: '1:1',
  })

  return response
}

const enableFilters = async ({
  spreadsheetId,
  tabName,
}: {
  spreadsheetId: string
  tabName: string
}) => {
  await init()

  const sheetId = await getTabIdByName({ spreadsheetId, tabName })
  if (!sheetId) return

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: tabName,
    majorDimension: 'COLUMNS',
  })

  const vals = resp.data?.values
  if (!vals) return

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          setBasicFilter: {
            filter: {
              range: {
                sheetId,
                startColumnIndex: 0,
                endColumnIndex: vals.length,
              },
            },
          },
        },
      ],
    },
  })

  return response
}

const formatTabs = async ({ spreadsheetId }: { spreadsheetId: string }) => {
  await init()

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  })

  const tabs = spreadsheet.data?.sheets
  const convertTabToUpperCase = async (tab: sheets_v4.Schema$Sheet) => {
    if (!tab.properties?.title || tab.properties?.title === upperCase(tab.properties?.title)) return
    const currentTabName = tab.properties?.title
    const newTabName = upperCase(currentTabName)

    await renameGoogleSheetTab({
      spreadsheetId,
      currentTabName,
      newTabName,
    })
  }

  const setTabColorByIndex = async (tab: sheets_v4.Schema$Sheet) => {
    const tabIndex = tab.properties?.index ?? 0
    const newTabColor = _TAB_COLORS[tabIndex]
    const tabName = tab.properties?.title as string

    await setTabColor({
      spreadsheetId,
      tabName,
      color: newTabColor,
    })
  }

  return Promise.all(
    map(
      async (tab: sheets_v4.Schema$Sheet) =>
        Promise.all([convertTabToUpperCase(tab), setTabColorByIndex(tab)]),
      tabs
    )
  )
}

const setTabColor = async ({
  spreadsheetId,
  tabName,
  color,
}: {
  spreadsheetId: string
  tabName: string
  color: TTabColor
}) => {
  await init()

  const sheetId = await getTabIdByName({ spreadsheetId, tabName })

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              tabColor: color,
            },
            fields: 'tabColor',
          },
        },
      ],
    },
  })

  return response
}

const formatTextAndWrap = async ({
  spreadsheetId,
  tabName,
}: {
  spreadsheetId: string
  tabName: string
}) => {
  await init()

  const sheetId = await getTabIdByName({ spreadsheetId, tabName })
  const range = {
    sheetId,
  }
  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range,
            cell: {
              userEnteredFormat: {
                textFormat: {
                  fontFamily: 'arial',
                  fontSize: 11,
                },
                wrapStrategy: 'CLIP',
              },
            },
            fields: 'userEnteredFormat(textFormat.fontFamily,textFormat.fontSize,wrapStrategy)',
          },
        },
      ],
    },
  })
  return response
}

const getTabIdByName = async ({
  spreadsheetId,
  tabName,
}: {
  spreadsheetId: string
  tabName: string
}) => {
  await init()

  const getSheetId = (sheet: sheets_v4.Schema$Spreadsheet) => {
    const sh: sheets_v4.Schema$Sheet | undefined = find(
      { properties: { title: tabName } },
      sheet.sheets
    )
    return sh?.properties?.sheetId
  }

  const response = await sheets.spreadsheets.get({ spreadsheetId })
  const id = getSheetId(response.data)
  if (id === undefined || id === null) throw new Error(`No tab with the name: ${tabName} found`)

  return id
}

/**
 * Range must be in A1 notation and must not include the sheet name
 * The range is where we start the search. Values are appended after the last row of the table.
 * Values is an array of arrays, which represent the rows to append
 * See: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
 */
const appendRows = async ({
  spreadsheetId,
  tabName,
  range,
  values,
  inputOption = 'RAW',
  insertDataOption = 'INSERT_ROWS',
}: {
  spreadsheetId: string
  tabName: string
  range?: string
  values: ISheetValue
  inputOption?: string
  insertDataOption?: 'INSERT_ROWS' | 'OVERWRITE' // https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
}) => {
  await init()
  return sheets.spreadsheets.values.append({
    // The ID of the spreadsheet to update.
    spreadsheetId,

    // The A1 notation of a range to search for a logical "table" of data.
    // Values are appended after the last row of the table.
    range: rangeString({ range, tabName }),

    // How the input data should be interpreted.
    valueInputOption: inputOption,

    // How the input data should be inserted.
    insertDataOption,

    requestBody: {
      range: rangeString({ range, tabName }),
      majorDimension: 'ROWS',
      values,
    },
  })
}

const rangeString = ({ range, tabName }: { range?: string; tabName: string }) =>
  range ? `'${tabName}'!${range}` : `'${tabName}'`

const writeToSheet = async ({
  spreadsheetId,
  tabName,
  range,
  values,
  includeHeaderRow = true,
}: {
  spreadsheetId: string
  tabName: string
  range?: string
  values: ITable | ISheetValue
  includeHeaderRow?: boolean
}) => {
  await init()
  const theRange = rangeString({ range, tabName })
  const vals = isTable(values)
    ? includeHeaderRow
      ? unzipArrayOfObjects(values)
      : tail(unzipArrayOfObjects(values))
    : includeHeaderRow
    ? values
    : tail(values)

  return sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        {
          range: theRange,
          majorDimension: 'ROWS',
          values: vals,
        },
      ],
    },
  })
}

/**
 * The sheet must have a header row
 */
const sheetRangeToJSON = (sheet: sheets_v4.Schema$ValueRange) =>
  zipArrayOfArraysToObjects(sheet.values as ISheetValue)

/**
 * Range must be in A1 notation and must not include the sheet name
 */
const getSheetData = async ({
  spreadsheetId,
  tabName,
  range,
  columns,
  convertToObjects = true,
  valueRenderOption = ValueRenderOption.FORMATTED_VALUE,
}: {
  spreadsheetId: string
  tabName?: string
  range?: string
  columns?: string[]
  convertToObjects?: boolean
  valueRenderOption?: ValueRenderOption
}): Promise<ITable | string[][]> => {
  await init()

  const actualTabName = tabName ?? (await getFirstTabName({ spreadsheetId }))
  const actualRange = rangeString({ range, tabName: actualTabName })

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: actualRange,
    majorDimension: 'ROWS',
    valueRenderOption,
    dateTimeRenderOption: 'FORMATTED_STRING',
  })
  const { data } = resp
  if (!convertToObjects) {
    return data.values ?? []
  }
  const rows = sheetRangeToJSON(data)

  if (!isEmpty(columns)) return map(pick(columns!), rows)
  return rows
}

/**
 * Returns the id of the new tab
 */
const createGoogleSheetTab = async ({
  spreadsheetId,
  title,
}: {
  spreadsheetId: string
  title: string
}) => {
  await init()

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title,
            },
          },
        },
      ],
    },
  })

  return response.data.replies && response.data.replies[0].addSheet?.properties?.sheetId
}

const moveFileToFolder = async ({ fileId, folderId }: { fileId: string; folderId: string }) => {
  await init()

  const file = await google.drive('v3').files.get({ fileId })
  if (!file || !file.data?.parents) return

  const moveRequest = await google.drive('v3').files.update({
    fileId,
    removeParents: file.data?.parents[0],
    addParents: folderId,
  })

  return moveRequest.data
}

const getSpreadsheetTitle = async ({ spreadsheetId }: { spreadsheetId: string }) => {
  await init()

  const response = await sheets.spreadsheets.get({ spreadsheetId })
  return response.data.properties?.title
}

const renameSpreadsheet = async ({
  spreadsheetId,
  newTitle,
}: {
  spreadsheetId: string
  newTitle: string
}) => {
  await init()

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSpreadsheetProperties: {
            properties: {
              title: newTitle,
            },
            fields: 'title',
          },
        },
      ],
    },
  })

  return response
}

const getSheets = async ({ spreadsheetId }: { spreadsheetId: string }) => {
  await init()

  const response = await sheets.spreadsheets.get({ spreadsheetId })
  return response.data.sheets
}

const renameGoogleSheetTab = async ({
  spreadsheetId,
  newTabName,
  currentTabName,
  tabId,
}: {
  spreadsheetId: string
  newTabName: string
} & (
  | { tabId: number; currentTabName?: undefined }
  | { currentTabName: string; tabId?: undefined }
)) => {
  await init()
  const sheetId = tabId ?? (await getTabIdByName({ spreadsheetId, tabName: currentTabName! }))

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              title: newTabName,
            },
            fields: 'title',
          },
        },
      ],
    },
  })

  return response
}

/**
 * Range must be in A1 notation and must not include the sheet name
 */
const convertToUpperCase = async ({
  spreadsheetId,
  tabName,
  range,
}: {
  spreadsheetId: string
  tabName: string
  range?: string
}) => {
  await init()
  const theRange = rangeString({ range, tabName })

  const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range: theRange })
  const { data } = resp
  const rows = data.values

  const capitalizedValues = map((row: ISheetValueRow) => {
    return map((cell: unknown) => {
      return isString(cell) ? upperCase(cell) : cell
    })(row)
  })(rows)

  const result = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: theRange,
    valueInputOption: 'RAW',
    requestBody: {
      values: capitalizedValues,
    },
  })

  return result
}

const getFirstTabName = async ({ spreadsheetId }: { spreadsheetId: string }) => {
  await init()

  const response = await sheets.spreadsheets.get({ spreadsheetId })
  if (!response) throw new Error(`Couldn't access spreadsheet: ${spreadsheetId}`)
  if (!response.data.sheets) throw new Error(`Spreadsheet has no tabs? ${spreadsheetId}`)
  return response.data.sheets[0].properties!.title!
}

/**
 * theData is a CSV file as one string
 */
const populateSheetWithCSV = async ({
  theData,
  spreadsheetId,
  tabName,
}: {
  theData?: string
  spreadsheetId: string
  tabName: string
}) => {
  await init()

  const sheetId = await getTabIdByName({ spreadsheetId, tabName })

  // Populate the sheet referenced by its ID with the data received (a CSV string)
  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          pasteData: {
            coordinate: {
              sheetId,
              rowIndex: 0,
              columnIndex: 0,
            },
            data: theData,
            type: 'PASTE_NORMAL',
            delimiter: ',',
          },
        },
      ],
    },
  })

  return response
}

// User can input URL or spreadsheet ID
// e.g https://docs.google.com/spreadsheets/d/XXXX-123-YYY/edit#gid=0
// or just XXXX-123-YYY
const getSpreadsheetId = (s: string) => (split('/', s).length > 1 ? split('/', s)[5] : s)

const getSpreadsheetUrl = (s: string) =>
  `https://docs.google.com/spreadsheets/d/${getSpreadsheetId(s)}`

const duplicateSpreadsheet = async (
  fileId: string,
  ignoreDefaultVisibility = false,
  includePermissionsForView?: string
) => {
  await init()
  return google
    .drive('v3')
    .files.copy({ fileId, ignoreDefaultVisibility, includePermissionsForView })
    .then((res) => res.data)
}

const makePublic = async (fileId: string) => {
  await init()
  return google
    .drive('v3')
    .permissions.create({
      fileId,
      requestBody: {
        role: 'writer',
        type: 'anyone',
      },
    })
    .then((res) => res.data)
}

const addSpreadsheetParent = async ({ fileId, folderId }: { fileId: string; folderId: string }) => {
  await init()

  return google
    .drive('v3')
    .files.update({ fileId, addParents: folderId })
    .then((res) => res.data)
}

const duplicateTab = async ({
  spreadsheetId,
  tabName,
  destinationSpreadsheetId,
  newTabName,
}: {
  spreadsheetId: string
  tabName: string
  destinationSpreadsheetId?: string
  newTabName?: string
}) => {
  await init()
  const sheetId = await getTabIdByName({ spreadsheetId, tabName })
  const response = await sheets.spreadsheets.sheets.copyTo({
    spreadsheetId,
    sheetId,
    requestBody: { destinationSpreadsheetId: destinationSpreadsheetId ?? spreadsheetId },
  })

  const newSheetId = response.data?.sheetId
  if (!newSheetId) throw new Error(`Couldn't copy tab: ${tabName}`)

  if (newTabName) {
    await renameGoogleSheetTab({
      spreadsheetId: destinationSpreadsheetId ?? spreadsheetId,
      newTabName,
      tabId: newSheetId,
    })
    return { ...response.data, title: newTabName }
  } else {
    return response.data
  }
}

export {
  addSpreadsheetParent,
  appendRows,
  convertToUpperCase,
  createGoogleSheetTab,
  createSpreadsheet,
  duplicateSpreadsheet,
  duplicateTab,
  enableFilters,
  formatHeader,
  formatTabs,
  formatTextAndWrap,
  getFirstTabName,
  getSheetData,
  getSheets,
  getSpreadsheetId,
  getSpreadsheetTitle,
  getSpreadsheetUrl,
  makePublic,
  moveFileToFolder,
  populateSheetWithCSV,
  renameGoogleSheetTab,
  renameSpreadsheet,
  sheetRangeToJSON,
  writeToSheet,
}
