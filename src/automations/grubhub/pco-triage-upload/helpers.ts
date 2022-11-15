import logger from '@invisible/logger'

import { establishSFDCConnection } from '../../../helpers/salesforce/init'

export const uploadToSalesForce = async (
  custID: string,
  caseNumber: string,
  actionTaken: string
) => {
  const sfdcConn = await establishSFDCConnection('grubhub')
  const data = await sfdcConn.query(
    `SELECT Id, AccountId FROM Case where CaseNumber='${caseNumber}'`
  )
  const records: any = data.records
  const totalSize = data.totalSize
  let uploadStatus = true
  let uploadMessage = 'Uploaded'

  if (totalSize == 0) {
    return [false, 'No case found with CaseNumber']
  }
  const caseID = records[0].Id
  const caseAccountID = records[0].AccountId

  if (custID) {
    const accData = await sfdcConn.queryAll(`Select Id FROM Account WHERE CustID__c=${custID}`)
    const accRecords: any = accData.records
    const accTotalSize = accData.totalSize

    if (accTotalSize > 0) {
      const accountID = accRecords[0].Id
      logger.debug(
        `Updated- CaseID: ${caseID} - Old AccountId: ${caseAccountID} - New AccountId: ${accountID}`
      )
      await sfdcConn.sobject('Case').update({
        Id: caseID,
        AccountId: accountID,
      })
      uploadStatus = true
      uploadMessage = 'Uploaded'
    } else {
      uploadStatus = false
      uploadMessage = 'Customer ID not found'
    }
  } else {
    if (actionTaken == 'Cust ID Found') {
      uploadStatus = false
      uploadMessage = 'Customer ID Missing'
    } else if (actionTaken == 'Restaurant Began PCO') {
      logger.debug(
        `Updated - CaseID: ${caseID} - Old AccountId: ${caseAccountID} - New AccountId: 0013b00001sYySTAA0`
      )
      await sfdcConn.sobject('Case').update({
        Id: caseID,
        AccountId: '0013b00001sYySTAA0', // hard-coded account_id
      })
      uploadStatus = true
      uploadMessage = 'Uploaded'
    }
  }
  return [uploadStatus, uploadMessage]
}
