import { expect } from 'chai'
import fs from 'fs'

import { csvToArrayOfArrays, csvToArrayOfObjects } from './csv'

const csvString = fs.readFileSync(`${__dirname}/../../test/data/test.csv`, { encoding: 'utf8' })

describe('csv', () => {
  describe('csvToArrayOfObjects', () => {
    it('should parse csv string, trim newlines, preserve internal newlines', async () => {
      const actual = csvToArrayOfObjects({ csvString })

      /* Note: internal blank lines are represented by the first key and an empty string */
      expect(actual).to.deep.eq([
        { Link: '' },
        { Link: '' },
        {
          Link: 'https://www.indeed.com/rc/clk?jk=eed7d9bbde5401be&fccid=1525f4c6f0030d21&vjs=3',
          Title: 'Route Delivery Driver - Class A CDL',
          Location: 'Mobile, AL',
          'Job Description': 'Individual must be detail oriented for accuracy in filling orders',
          Company: 'Blevins , Inc.',
          Id: '123',
        },
        {
          Link: 'https://www.indeed.com/rc/clk?jk=9723e04d36597785&fccid=1525f4c6f0030d21&vjs=3',
          Title: 'Warehouse Worker',
          Location: 'Nashville, TN',
          'Job Description': 'Labeling and processing all in-bound and out-bound freight',
          Company: 'Blevins , Inc.',
          Id: '234',
        },
        { Link: '' },
        {
          Link: 'https://www.indeed.com/rc/clk?jk=1d9e1ff7237be4e0&fccid=1525f4c6f0030d21&vjs=3',
          Title: 'Route Delivery Driver - Class B CDL',
          Location: 'Nashville, TN',
          'Job Description': 'Valid Class B Commercial Driver’s License',
          Company: 'Blevins , Inc.',
          Id: '456',
        },
      ])
    })

    it('should skip empty lines', async () => {
      const actual = csvToArrayOfObjects({ csvString, skipEmptyLines: true })

      expect(actual).to.deep.eq([
        {
          Link: 'https://www.indeed.com/rc/clk?jk=eed7d9bbde5401be&fccid=1525f4c6f0030d21&vjs=3',
          Title: 'Route Delivery Driver - Class A CDL',
          Location: 'Mobile, AL',
          'Job Description': 'Individual must be detail oriented for accuracy in filling orders',
          Company: 'Blevins , Inc.',
          Id: '123',
        },
        {
          Link: 'https://www.indeed.com/rc/clk?jk=9723e04d36597785&fccid=1525f4c6f0030d21&vjs=3',
          Title: 'Warehouse Worker',
          Location: 'Nashville, TN',
          'Job Description': 'Labeling and processing all in-bound and out-bound freight',
          Company: 'Blevins , Inc.',
          Id: '234',
        },
        {
          Link: 'https://www.indeed.com/rc/clk?jk=1d9e1ff7237be4e0&fccid=1525f4c6f0030d21&vjs=3',
          Title: 'Route Delivery Driver - Class B CDL',
          Location: 'Nashville, TN',
          'Job Description': 'Valid Class B Commercial Driver’s License',
          Company: 'Blevins , Inc.',
          Id: '456',
        },
      ])
    })
  })

  describe('csvToArrayOfArrays', () => {
    it('should parse csv string', async () => {
      const actual = csvToArrayOfArrays({ csvString })

      /* Note: internal blank lines are represented by an array of one empty string */
      expect(actual).to.deep.eq([
        ['Link', 'Title', 'Location', 'Job Description', 'Company', 'Id'],
        [''],
        [''],
        [
          'https://www.indeed.com/rc/clk?jk=eed7d9bbde5401be&fccid=1525f4c6f0030d21&vjs=3',
          'Route Delivery Driver - Class A CDL',
          'Mobile, AL',
          'Individual must be detail oriented for accuracy in filling orders',
          'Blevins , Inc.',
          '123',
        ],
        [
          'https://www.indeed.com/rc/clk?jk=9723e04d36597785&fccid=1525f4c6f0030d21&vjs=3',
          'Warehouse Worker',
          'Nashville, TN',
          'Labeling and processing all in-bound and out-bound freight',
          'Blevins , Inc.',
          '234',
        ],
        [''],
        [
          'https://www.indeed.com/rc/clk?jk=1d9e1ff7237be4e0&fccid=1525f4c6f0030d21&vjs=3',
          'Route Delivery Driver - Class B CDL',
          'Nashville, TN',
          'Valid Class B Commercial Driver’s License',
          'Blevins , Inc.',
          '456',
        ],
      ])
    })

    it('should skip empty lines', async () => {
      const actual = csvToArrayOfArrays({ csvString, skipEmptyLines: true })

      expect(actual).to.deep.eq([
        ['Link', 'Title', 'Location', 'Job Description', 'Company', 'Id'],
        [
          'https://www.indeed.com/rc/clk?jk=eed7d9bbde5401be&fccid=1525f4c6f0030d21&vjs=3',
          'Route Delivery Driver - Class A CDL',
          'Mobile, AL',
          'Individual must be detail oriented for accuracy in filling orders',
          'Blevins , Inc.',
          '123',
        ],
        [
          'https://www.indeed.com/rc/clk?jk=9723e04d36597785&fccid=1525f4c6f0030d21&vjs=3',
          'Warehouse Worker',
          'Nashville, TN',
          'Labeling and processing all in-bound and out-bound freight',
          'Blevins , Inc.',
          '234',
        ],
        [
          'https://www.indeed.com/rc/clk?jk=1d9e1ff7237be4e0&fccid=1525f4c6f0030d21&vjs=3',
          'Route Delivery Driver - Class B CDL',
          'Nashville, TN',
          'Valid Class B Commercial Driver’s License',
          'Blevins , Inc.',
          '456',
        ],
      ])
    })
  })
})
