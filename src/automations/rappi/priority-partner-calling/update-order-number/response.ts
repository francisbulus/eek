import { IRow, ITable } from '../../../../helpers/arrays'
import { getSheetData, getSpreadsheetId } from '../../../../helpers/google/sheets'

const trackingSpreadsheetUrl =
  'https://docs.google.com/spreadsheets/d/1xzSJ1Jqjk86SGqa5pzeIQHF7a6bLC-OHQmOvFai-rUk/edit#gid=797545948'

export const getUpdatedNumberOfOrders = async ({
  storeId,
  sobOrOutb,
}: {
  storeId: string
  sobOrOutb: string
}) => {
  const spreadsheetId = getSpreadsheetId(trackingSpreadsheetUrl)

  const tabName = sobOrOutb === 'SOB' ? 'SOB_Performance' : 'HUNTING_PERFORMANCE'

  const data = (await getSheetData({ spreadsheetId, tabName })) as ITable

  const storeData = data.find((record: IRow) => record['STORE_ID'] === storeId) as IRow

  return Number(storeData['ORDERS_NETAS_F30D_ACUM'])
}
