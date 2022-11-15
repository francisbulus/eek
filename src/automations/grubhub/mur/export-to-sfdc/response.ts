import logger from '@invisible/logger'
import pMap from 'p-map'

import { formatObject, getChildBaseRunItems } from '../../../../external/grubhub/helpers'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'
import { BaseRun } from '../../../../helpers/types'

export const uploadToSalesForce = async (
  baseRunId: string,
  caseNumberId: string,
  errorsBaseID: string,
  parentCaseNumberId: string,
  baseRun: BaseRun
) => {
  const connection = await establishSFDCConnection('grubhub')

  const currentBaseValues = await formatObject(baseRun)
  const caseNumber = currentBaseValues[caseNumberId]
  const parentCaseNumber = currentBaseValues[parentCaseNumberId]
  let qualityScore = null

  const errors = await getChildBaseRunItems({
    stepBaseRunId: baseRunId,
    baseId: errorsBaseID,
  })

  const data = await connection.queryAll(
    `SELECT id, CaseNumber FROM Case WHERE CaseNumber='${caseNumber}' LIMIT 1`
  )
  const records: any = data.records
  const totalSize = data.totalSize

  if (totalSize == 0) {
    return {
      uploadStatus: 'Failed',
      qualityScore,
      uploadText: 'Case Not Under Us Anymore',
    }
  }
  const caseId = records[0].Id

  if (errors.length > 0) {
    await pMap(
      errors,
      async (error) => {
        if (
          error.Brand &&
          error['Category Name'] &&
          error['Number Of Errors'] &&
          error['Product Name'] &&
          error['Error Type'] &&
          error['Error Category']
        ) {
          const reportedError = (await connection.sobject('Update_Error_Reporting__c').create({
            Case_Update__c: caseId,
            Brand__c: error.Brand,
            Category_Name__c: error['Category Name'],
            Don_t_Count_Error__c:
              !error['Dont Count Error'] || error['Dont Count Error'] === undefined ? false : true,
            Error_Category__c: error['Error Category'],
            Error_Correction__c: error['Error Correction'],
            Error_Description__c: error['Error Description'],
            Error_Type__c: error['Error Type'],
            Item_Name__c: error['Product Name'],
            SML_Error_Summary__c: error['Error Summary'],
            of_Errors__c: error['Number Of Errors'],
          })) as any

          logger.debug(`Grubhub MUR - Created Error Reporting`, reportedError)
        }
      },
      { concurrency: 1 }
    )
  }

  const qualityScoreData = await connection.queryAll(
    `SELECT id, CaseNumber, Quality_Score__c FROM Case WHERE CaseNumber='${caseNumber}' LIMIT 1`
  )
  const response: any = qualityScoreData.records
  qualityScore = response[0].Quality_Score__c

  if (!qualityScore) {
    qualityScore = 100.0
  }

  let result = {
    uploadStatus: 'Uploaded',
    qualityScore,
    uploadText: 'Uploaded',
  }

  try {
    const date = new Date()
    const updatedCase = (await connection.sobject('Case').update({
      Id: caseId,
      Update_Start_1__c: date.toISOString(),
      Update_Stop_1__c: date.toISOString(),
      Update_Complete_Time__c: date.toISOString(),
      Status: 'Closed',
      Reason: 'Update Completed',
      OwnerId: '00GC0000002QxF7MAK',
    })) as any
    logger.debug(`Grubhub MUR - Updated Case Data`, updatedCase)

    const data = await connection.queryAll(
      `SELECT id, CaseNumber FROM Case WHERE CaseNumber='${parentCaseNumber}' LIMIT 1`
    )
    const records: any = data.records
    const totalSize = data.totalSize

    if (totalSize == 0) {
      result = {
        uploadStatus: 'Failed',
        qualityScore: null,
        uploadText: 'Parent Case Not Under Us Anymore',
      }
      return
    }

    const updatedParentCase = (await connection.sobject('Case').update({
      Id: records[0].Id,
      Menu_Grade__c: qualityScore,
    })) as any

    logger.debug(`Grubhub MUR - Updated Parent Case Data Menu Grade`, updatedParentCase)
  } catch (error) {
    logger.debug(`Grubhub MUR - Error While uploading case ${caseNumber}`, error)
    result = {
      uploadStatus: 'Failed',
      qualityScore: null,
      uploadText: 'Failed to Update Parent Case Menu Grade',
    }
  }

  return result
}
