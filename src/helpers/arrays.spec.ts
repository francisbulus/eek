import { expect } from 'chai'

import { IRow, mapFields, unzipArrayOfObjects, zipArrayOfArraysToObjects } from './arrays'

describe('arrays', () => {
  const setup = () => {
    const rows = [
      ['header 1', 'header 2', 'header 3'],
      ['hi', '', 'bye'],
      ['', '', ''],
      ['1', '2', '3'],
    ]

    const objs = [
      { a: 'hi', b: '2', c: 'bye' },
      { a: 'asdf', b: 'fdfd', c: 'c' },
      { a: 'zzzz', b: 'xxxxx', c: 'yyyy' },
    ]

    return { rows, objs }
  }

  describe('unzipArrayOfObjects', () => {
    it('should unzip an array of objects to an array of arrays', async () => {
      const { objs } = setup()

      const actual = unzipArrayOfObjects(objs)

      expect(actual).to.deep.eq([
        ['a', 'b', 'c'],
        ['hi', '2', 'bye'],
        ['asdf', 'fdfd', 'c'],
        ['zzzz', 'xxxxx', 'yyyy'],
      ])
    })

    it('should reverse the zip', () => {
      const { rows } = setup()

      const actual = unzipArrayOfObjects(zipArrayOfArraysToObjects(rows))

      expect(actual).to.deep.eq(rows)
    })
  })

  describe('zipArrayOfArraysToObjects', () => {
    it('should unzip an array of objects to an array of arrays', async () => {
      const { rows } = setup()

      const actual = zipArrayOfArraysToObjects(rows)

      expect(actual).to.deep.eq([
        { 'header 1': 'hi', 'header 2': '', 'header 3': 'bye' },
        { 'header 1': '', 'header 2': '', 'header 3': '' },
        { 'header 1': '1', 'header 2': '2', 'header 3': '3' },
      ])
    })
  })

  describe('mapFields', () => {
    const destinationHeaderRow = ['h1', 'ignore 1', 'h2', 'ignore 2', 'h3', 'h4']

    // Notice that 'ignore 2' is in destinationHeaderRow but not in fieldMapping. This is OK
    const fieldMapping = {
      h1: 'c',
      h2: 'b',
      h3: 'a',
      'ignore 1': null,
      h4: (obj: IRow) => `${obj.a}: ${obj.b}`,
    }

    it('should remap columns, should call function for mapped field on entire row if provided', async () => {
      const { objs } = setup()

      const actual = mapFields({ values: objs, destinationHeaderRow, fieldMapping })

      expect(actual).to.deep.eq([
        ['bye', '', '2', '', 'hi', 'hi: 2'],
        ['c', '', 'fdfd', '', 'asdf', 'asdf: fdfd'],
        ['yyyy', '', 'xxxxx', '', 'zzzz', 'zzzz: xxxxx'],
      ])
    })

    it('should return the destination header if includeDestinationHeader === true ', async () => {
      const { objs } = setup()

      const actual = mapFields({
        values: objs,
        destinationHeaderRow,
        fieldMapping,
        includeDestinationHeader: true,
      })

      expect(actual).to.deep.eq([
        ['h1', 'ignore 1', 'h2', 'ignore 2', 'h3', 'h4'],
        ['bye', '', '2', '', 'hi', 'hi: 2'],
        ['c', '', 'fdfd', '', 'asdf', 'asdf: fdfd'],
        ['yyyy', '', 'xxxxx', '', 'zzzz', 'zzzz: xxxxx'],
      ])
    })

    it('should return an array of objects if returnObjects === true', async () => {
      const { objs } = setup()
      const actual = mapFields({
        values: objs,
        destinationHeaderRow,
        fieldMapping,
        returnObjects: true,
      })

      expect(actual).to.deep.eq([
        {
          h1: 'bye',
          'ignore 1': '',
          h2: '2',
          'ignore 2': '',
          h3: 'hi',
          h4: 'hi: 2',
        },
        {
          h1: 'c',
          'ignore 1': '',
          h2: 'fdfd',
          'ignore 2': '',
          h3: 'asdf',
          h4: 'asdf: fdfd',
        },
        {
          h1: 'yyyy',
          'ignore 1': '',
          h2: 'xxxxx',
          'ignore 2': '',
          h3: 'zzzz',
          h4: 'zzzz: xxxxx',
        },
      ])
    })
  })
})
