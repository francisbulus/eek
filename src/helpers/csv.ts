import * as chardet from 'chardet'
import * as iconv from 'iconv-lite'
import { first, get, trim } from 'lodash/fp'
import * as Papa from 'papaparse'
import superagent from 'superagent'

import { IRow } from './arrays'

/**
 * We use `blob` type here, because people can upload CSVs in wack (non utf-8) formats
 */
const readCSVContent = async (csvFileUrl: string) =>
  superagent
    .get(csvFileUrl)
    .responseType('blob')
    .then(get('body'))
    .then((s: Buffer) => iconv.decode(s, chardet.detect(s) ?? 'utf-8')) as Promise<string>

const trimNewlines = (csvString: string) => trim(csvString)

const preProcess = (rawCsvString: string) => trimNewlines(rawCsvString)

const getSampleData = async (csvFileUrl: string) => {
  const csvString = await readCSVContent(csvFileUrl)
  return first(csvToArrayOfObjects({ csvString, skipEmptyLines: true }))
}

const csvToArrayOfArrays = ({
  csvString,
  skipEmptyLines = false,
}: {
  csvString: string
  skipEmptyLines?: boolean
}) => Papa.parse<string[]>(preProcess(csvString), { skipEmptyLines }).data

const csvToArrayOfObjects = ({
  csvString,
  skipEmptyLines = false,
}: {
  csvString: string
  skipEmptyLines?: boolean
}) => Papa.parse<IRow>(preProcess(csvString), { header: true, skipEmptyLines }).data

export {
  csvToArrayOfArrays,
  csvToArrayOfObjects,
  getSampleData,
  preProcess,
  readCSVContent,
  trimNewlines,
}
