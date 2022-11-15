import {
  first,
  head,
  isArray,
  isNumber,
  isString,
  isUndefined,
  keys,
  map,
  mapValues,
  reduce,
  tail,
  toLower,
  trim,
  zipObject,
} from 'lodash/fp'

const isNumeric = (n: string | number): boolean =>
  (isNumber(n) || (isString(n) && Boolean((n as string).trim()))) && isFinite(n as number)

type IRow = Record<string, string | undefined>
type ITable = IRow[]

type IParsedCell = string | number | boolean | null | undefined
type IParsedRow = Record<string, IParsedCell>
type IParsedTable = IParsedRow[]

type ISheetValueRow = string[]
type ISheetValue = ISheetValueRow[]

/**
 * example of Table:
 * [
 *   { firstName: 'rick', lastName: 'sanchez', email: 'ricksanchez@rickandmorthy.com' },
 *   { firstName: 'morty', lastName: 'smith', email: 'mortysmith@rickandmorthy.com' },
 *   { firstName: 'jerry', lastName: 'smith', email: 'jerrysmith@rickandmorthy.com' },
 * ]
 *
 * example of SheetValue:
 * [
 *   ['firstName', 'lastName', 'email'],
 *   ['rick', 'sanchez', 'ricksanchez@rickandmorthy.com'],
 *   ['morty', 'smith', 'mortysmith@rickandmorthy.com'],
 *   ['jerry', 'smith', 'jerrysmith@rickandmorthy.com'],
 * ]
 *
 * Most of the time, we will be passing around ITable to manipulate the data.
 * We will convert to ISheetValue when writing to a sheet.
 */

/**
 * Takes a table of string | undefined and parses numbers, booleans, undefined
 * When a sheet is read from Google Sheets, the values are not parsed initially
 */
const parseValues = (arr: ITable): IParsedTable =>
  map(
    (row: IRow) =>
      mapValues((s: string) => {
        if (isNumeric(s)) return parseFloat(s)
        if (isString(s)) {
          if (toLower(s) === 'true') return true
          if (toLower(s) === 'false') return false
          return s
        }
        return s
      }, row),
    arr
  )

/**
 * Converts all values to strings
 */
const unParseValues = (arr: IParsedTable) =>
  (map(
    (row: IParsedRow) =>
      mapValues((s: string | number | boolean | null | undefined) => {
        if (isUndefined(s) || s === null) return ''
        return `${s}`
      }, row),
    arr
  ) as unknown) as ITable

const unzipArrayOfObjects = (arr: ITable) => {
  const headers = keys(first(arr)) as ISheetValueRow
  const vals = map(
    (row: IRow) =>
      reduce(
        (acc: (string | undefined)[], key: string) => [...acc, row[key] ?? ''],
        [] as ISheetValueRow,
        headers
      ),
    arr
  )
  return [headers, ...vals] as ISheetValue
}

const zipArrayOfArraysToObjects = (rows: ISheetValue, trimHeaders = true) => {
  const header = head(rows) ?? []
  const headerRow = trimHeaders ? map(trim, header) : header
  return (map(zipObject(headerRow), tail(rows)) as unknown) as ITable
}

const removeHeaderRow = (rows: ISheetValue) => tail(rows)

const isTable = (rows: ISheetValue | ITable): rows is ITable =>
  Boolean(!isArray(first(rows as any)))

interface IMapFieldArgs {
  values: ITable
  destinationHeaderRow: string[]
  fieldMapping: Record<string, string | undefined | null | ((obj: IRow) => string)>
  includeDestinationHeader?: boolean
}

function mapFields<T extends boolean = false>({
  values,
  destinationHeaderRow,
  fieldMapping,
  returnObjects,
  includeDestinationHeader,
}: IMapFieldArgs & { returnObjects?: T }): T extends true ? ITable : ISheetValue
function mapFields({
  values,
  destinationHeaderRow,
  fieldMapping,
  returnObjects = false,
  includeDestinationHeader = false,
}: IMapFieldArgs & { returnObjects?: boolean }): ITable | ISheetValue {
  const mappedValues = map(
    (row: IRow): ISheetValueRow =>
      map((header: string) => {
        const mapped = fieldMapping[header]
        if (typeof mapped === 'function') {
          return mapped(row)
        } else if (typeof mapped === 'string') {
          return row[mapped] ?? ''
        }
        return ''
      }, destinationHeaderRow)
  )(values)

  if (returnObjects) return zipArrayOfArraysToObjects([destinationHeaderRow, ...mappedValues])
  if (includeDestinationHeader) return [destinationHeaderRow, ...mappedValues]
  return mappedValues
}

export {
  isTable,
  mapFields,
  parseValues,
  removeHeaderRow,
  unParseValues,
  unzipArrayOfObjects,
  zipArrayOfArraysToObjects,
}

export type { IMapFieldArgs, IRow, ISheetValue, ISheetValueRow, ITable }
