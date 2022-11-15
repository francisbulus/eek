import { main } from '.'

// Remove the x to test
xdescribe('get-sample-from-google-sheet', () => {
  it('should work', async () => {
    const googleSheetUrl = '1bK8Zh9HwujeFNOMfptJZTgMyWqg8DHau84aogYUCHN4'
    const tabName = 'Sheet1'

    const sampleData = await main({ googleSheetUrl, tabName })

    console.log(sampleData) // eslint-disable-line no-console
  })
})
