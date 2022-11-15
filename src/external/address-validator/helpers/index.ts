import { forEach, includes, indexOf, join, split } from 'lodash'

const fullWord: Record<string, string> = {
  APT: 'Apartment',
  'APT,': 'Apartment',
  Ave: 'Avenue',
  'Ave,': 'Avenue,',
  Dr: 'District',
  'Dr,': 'District,',
  Ln: 'Lane',
  'Ln,': 'Lane,',
  St: 'Street',
  'St,': 'Street,',
  Rd: 'Road',
  'Rd,': 'Road,',
  Rte: 'Route',
  'Rte,': 'Route,',
}

function formatAbbreviations(address: string): string {
  const stringArr = split(address, ' ')
  forEach(fullWord, (word, key) => {
    if (includes(stringArr, key)) {
      stringArr[indexOf(stringArr, key)] = word
    }
  })
  const result = join(stringArr, ' ')
  return result
}

export { formatAbbreviations }
