import { appendRows, duplicateTab, getSheetData } from './sheets'

xdescribe('Google Sheets Helpers', () => {
  xdescribe('appendRows', () => {
    it('should append', async () => {
      const resp = await appendRows({
        spreadsheetId: '1uXk-kzieGmUpUpVEHW4FaZ3sELzbVBo92Ybb1D3tD58',
        tabName: 'test',
        range: 'A1',
        values: [
          ['hi', 'there', 'buddy'],
          ['zoop', 'zippity', 'zop'],
          ['a', 'b', 'c', 'd', 'e'],
        ],
      })
      console.log(resp) // eslint-disable-line no-console
    })
  })

  xdescribe('duplicateTab', () => {
    it('should copy a tab to same sheet if not destination provided', async () => {
      const resp = await duplicateTab({
        spreadsheetId: '1uXk-kzieGmUpUpVEHW4FaZ3sELzbVBo92Ybb1D3tD58',
        tabName: 'test',
      })
      console.log(resp) // eslint-disable-line no-console
    })

    it('should copy a tab to given sheet', async () => {
      const resp = await duplicateTab({
        spreadsheetId: '1uXk-kzieGmUpUpVEHW4FaZ3sELzbVBo92Ybb1D3tD58',
        tabName: 'test',
        destinationSpreadsheetId: '1z1LFOHvZp3_hB2TBetVorfSDiBXXswLXjL3Jb0h_BNo',
      })
      console.log(resp) // eslint-disable-line no-console
    })

    it('should copy a tab to given sheet and rename', async () => {
      const resp = await duplicateTab({
        spreadsheetId: '1uXk-kzieGmUpUpVEHW4FaZ3sELzbVBo92Ybb1D3tD58',
        tabName: 'test',
        destinationSpreadsheetId: '1z1LFOHvZp3_hB2TBetVorfSDiBXXswLXjL3Jb0h_BNo',
        newTabName: 'hi',
      })
      console.log(resp) // eslint-disable-line no-console
    })
  })

  xdescribe('getSheetData', () => {
    it('should read the sheet data', async () => {
      const resp = await getSheetData({
        spreadsheetId: '1uXk-kzieGmUpUpVEHW4FaZ3sELzbVBo92Ybb1D3tD58',
        tabName: 'test',
      })
      console.log(resp) // eslint-disable-line no-console
    })
  })
})
