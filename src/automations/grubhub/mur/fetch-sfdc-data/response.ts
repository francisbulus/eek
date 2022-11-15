import logger from '@invisible/logger'
import pMap from 'p-map'

import { UUIDs } from '../../../../external/grubhub/constants'
import { fetchExistingBaseRunsValues } from '../../../../external/grubhub/helpers'
import { IRow } from '../../../../helpers/arrays'
import { createDocInFolder } from '../../../../helpers/google/doc'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'
import { uploadToGDrive } from '../../../upload-google-drive'

const getCaseOppLevelAttachments = async (
  linkedEntityId: string,
  caseNr: string,
  connection: any
) => {
  if (!linkedEntityId || caseNr) return ''

  let resultDriveLink = ''

  try {
    const data = await connection.queryAll(
      `SELECT ContentDocumentId  FROM ContentDocumentLink WHERE LinkedEntityId='${linkedEntityId}'`
    )
    const records: any = data.records

    await pMap(
      records,
      async (record: IRow) => {
        const getContentVersion = (await connection
          .sobject('ContentVersion')
          .findOne()
          .where(`ContentDocumentId = '${record.ContentDocumentId}'`)
          .select(`Id, FileExtension, Title`)) as any

        if (getContentVersion.FileExtension !== 'snote') {
          const createdFile = await uploadToGDrive({
            files: [
              {
                url: `https://na104.salesforce.com/services/data/v42.0/sobjects/ContentVersion/${getContentVersion.Id}/VersionData`,
                fileName: getContentVersion.Title + ' ' + caseNr,
              },
            ],
            driveFolderKey: UUIDs.BatchFolders.MURBatchFolder,
            fetchHeaders: {
              'Content-Type': 'application/text',
              Authorization: `Bearer ${connection.accessToken}`,
            },
          })

          resultDriveLink += `${createdFile.uploadedFileUrls[0]} \n\n`
          logger.info(resultDriveLink)
        }
      },
      { concurrency: 1 }
    )
  } catch (error) {
    logger.info(`Grubhub MUR - Get Files error at case ${caseNr}`, error)
  }

  try {
    const data = await connection.queryAll(
      `SELECT id, Name, CreatedById  FROM Attachment WHERE ParentId='${linkedEntityId}'`
    )
    const records: any = data.records

    await pMap(
      records,
      async (record: IRow) => {
        if (record.CreatedById !== '0052L000003Wzl0QAC') {
          const createdFile = await uploadToGDrive({
            files: [
              {
                url: `https://na104.salesforce.com/services/data/v42.0/sobjects/Attachment/${record.Id}/body`,
                fileName: record.Name + ' ' + caseNr,
              },
            ],
            driveFolderKey: UUIDs.BatchFolders.MURBatchFolder,
            fetchHeaders: {
              'Content-Type': 'application/text',
              Authorization: `Bearer ${connection.accessToken}`,
            },
          })

          resultDriveLink += `${createdFile.uploadedFileUrls[0]} \n\n`
          logger.info(resultDriveLink)
        }
      },
      { concurrency: 1 }
    )
  } catch (error) {
    logger.info(`Grubhub MUR - Get Files attachments at case ${caseNr}`, error)
  }

  return resultDriveLink
}

const fetchSFDCData = async () => {
  const connection = await establishSFDCConnection('grubhub')

  const caseBaseUrl = 'https://na104.salesforce.com/'

  const caseData: any[] = []

  const existingBaseRuns = await fetchExistingBaseRunsValues({
    baseId: UUIDs.Bases.MURCases as string,
    baseVariableIds: [UUIDs.BaseVariables.MURCaseNumberId],
    status: 'pending',
  })

  const data = await connection.queryAll(
    `SELECT Id, AccountId, Status, CaseNumber, Subject, Description, CreatedDate, SuppliedName, SuppliedEmail, OwnerId, 
    Respond_To_Email__c, Respond_To_Second_Email__c, Package_Status__c, Update_Type__c, Update_Sites__c, OTT_Restaurant__c, 
    Enterprise__c, Triage_Name__c, Menu_Track__c, ME_Rep_Name__c, Origin,Flag_for_QA__c, GFR_Page__c, Menu_Item_Count__c FROM Case WHERE (RecordTypeId='012C0000000BsMZIA0') 
    AND Reason = 'Update Completed'
    AND (Origin = 'Email' OR Origin = 'Phone' OR Origin = 'Web' OR Origin = 'Cloned Case' OR Origin = 'Catering Menu Add') 
    AND ClosedDate > LAST_WEEK 
    AND (Menu_Track__c = 'Infocache' OR Menu_Track__c = 'Ukraine/PI'  OR Menu_Track__c = 'Invisible'  OR Menu_Track__c = 'Taskeater') 
    AND Menu_Grade__c = null 
    AND Flag_for_QA__c = true 
    AND (Update_Type__c != 'Special Project Quick' AND Update_Type__c != 'Special Project Regular')
    AND (NOT Owner.Alias LIKE '%Midstream%')`
  )
  const records: any = data.records
  const totalSize = data.totalSize

  if (totalSize == 0) {
    return caseData
  }

  await pMap(
    records,
    async (parentCaseRow: IRow) => {
      const active = existingBaseRuns.includes(parentCaseRow['CaseNumber'] as string)

      let custID = null

      if (!active) {
        let bucket = 'Standard'
        if (parentCaseRow.Menu_Item_Count__c && parseInt(parentCaseRow.Menu_Item_Count__c) > 150) {
          bucket = 'Large'
        }

        const caseLevelAttach = await getCaseOppLevelAttachments(
          parentCaseRow.Id ?? '',
          parentCaseRow.CaseNumber ?? '',
          connection
        )
        logger.info(`Grubhub MUR - Parent Case`, parentCaseRow)
        const clonedCase = (await connection.sobject('Case').create({
          AccountId: parentCaseRow.AccountId,
          Status: 'New',
          RecordTypeId: '012C0000000IJsKIAW',
          Origin: parentCaseRow.Origin,
          Subject: parentCaseRow.Subject,
          Description: parentCaseRow.Description,
          Respond_To_Email__c: parentCaseRow.Respond_To_Email__c,
          Respond_To_Second_Email__c: parentCaseRow.Respond_To_Second_Email__c,
          Update_Type__c: parentCaseRow.Update_Type__c,
          Update_Sites__c: parentCaseRow.Update_Sites__c,
          Triage_Name__c: parentCaseRow.Triage_Name__c,
          Menu_Track__c: parentCaseRow.Menu_Track__c,
          ME_Rep_Name__c: parentCaseRow.ME_Rep_Name__c,
          Flag_for_QA__c: parentCaseRow.Flag_for_QA__c,
          ParentId: parentCaseRow.Id,
          OwnerId: '00GC0000002QxF7MAK',
        })) as any

        logger.info(`Grubhub MUR - Cloned Case`, clonedCase)
        const clonedCaseRow = (await connection
          .sobject('Case')
          .findOne()
          .where(`id = '${clonedCase.id}'`)
          .select(`id, AccountId, Status, CaseNumber, Subject, Description, CreatedDate, SuppliedName, SuppliedEmail, OwnerId,
          Respond_To_Email__c, Respond_To_Second_Email__c, Package_Status__c, Update_Type__c, Update_Sites__c, OTT_Restaurant__c,
          Enterprise__c, Triage_Name__c, Menu_Track__c, ME_Rep_Name__c, Flag_for_QA__c`)) as any

        if (clonedCaseRow.Description && clonedCaseRow.Description.length > 1500) {
          const gdocResult = await createDocInFolder({
            content: clonedCaseRow.Description,
            folderId: UUIDs.BatchFolders.MURDescFolder,
            title: `Description: ${clonedCaseRow.CaseNumber}`,
          })
          clonedCaseRow.Description = `Find here:  https://docs.google.com/document/d/${gdocResult.id}`
        }

        if (clonedCaseRow.AccountId) {
          const accountData = (await connection
            .sobject('Account')
            .findOne()
            .where(`Id = '${clonedCaseRow.AccountId}'`)
            .select('CustID__c')) as any

          custID = accountData.CustID__c
        }

        if (parentCaseRow.GFR_Page__c) {
          parentCaseRow.GFR_Page__c = parentCaseRow.GFR_Page__c.replace('<a href="', '').replace(
            '" target="_blank">GFR Page</a>',
            ''
          )
        }

        caseData.push({
          caseNumber: clonedCaseRow.CaseNumber,
          customerID: custID,
          subject: clonedCaseRow.Subject,
          description: clonedCaseRow.Description,
          parentCaseNumber: parentCaseRow.CaseNumber,
          caseUrl: caseBaseUrl + clonedCaseRow.id,
          packageStatus: parentCaseRow.Package_Status__c,
          menuUrls: caseLevelAttach,
          gfrLink: parentCaseRow.GFR_Page__c,
          vendor: parentCaseRow.Menu_Track__c,
          murType: bucket,
        })
      }
    },
    { concurrency: 1 }
  )
  return caseData
}

export { fetchSFDCData }
