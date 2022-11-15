import { filter, map, omit } from 'lodash'

import { checkForActiveBaseRun } from '../../../../external/doordash/coo/helpers'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'

const fetchSFDCReportData = async () => {
  const connection = await establishSFDCConnection('doordash')

  // Fetch all Cases in AIT Report
  const allAITReportCases: any = await connection
    .sobject('Case')
    .find()
    .select(
      'Id, CaseNumber, Account_Deck_Rank__c, Op_Owner__c, Language__c, AccountId, Status_Reason__c'
    )
    .where(
      `(RecordTypeId='0121a0000006QogAAE' OR RecordTypeId='0121a0000006S4fAAE') 
      AND Status !='Closed' AND Status !='Pending' AND Status !='Solved' AND Status !='Waiting for DD Internal Team' AND Status !='Abandoned'
      AND (NOT Account_Deck_Rank__c LIKE '%Spades%') 
      AND (Owner.Name = 'New Partners (Activations)' OR Owner.Name = 'New Partners (Activation Requests)')
      AND (NOT Business_Vertical_Details__c LIKE '%Retail%')`
    )
    .execute()

  // Get list of all Account IDs across all Cases in AIT Report
  const allAccountIds = filter(
    map(allAITReportCases, (row) => row.AccountId),
    (accountId) => {
      return accountId !== null
    }
  )

  // Get all MO Cases associated with the Accounts to which the AIT Cases belong
  const moCases: any = await connection
    .sobject('Case')
    .find()
    .select('Id, CaseNumber, Business_Vertical_Details__c, AccountId')
    .where(`RecordTypeId = '0122L000000g1jD' AND AccountId IN ('${allAccountIds.join("','")}')`)
    .execute()

  // Get all Blocked Milestones on the MO Cases
  const moCasesMilestones: any = await connection
    .sobject('Milestone__c')
    .find()
    .select('Milestone_Type__c, Case__c')
    .where(`Status__c = 'Blocked' AND Case__c IN ('${map(moCases, (row) => row.Id).join("','")}')`)
    .execute()

  //Put together all data in one object.
  // If Business_Vertical_Details__c of the MO Case associated to the AIT Case includes the term "retail", we don't import.
  const allData = filter(
    map(allAITReportCases, (record) => {
      // Find MO Cases related to the particular AIT Case
      const moCasesForRecord = filter(moCases, (moCase) => {
        return moCase['AccountId'] === record['AccountId']
      })

      return {
        ...omit(record, ['Id']),
        caseId: record.Id,
        caseURL: 'https://figment.lightning.force.com/lightning/r/Case/' + record.Id,
        ssmo:
          record['Op_Owner__c'] &&
          ['0052L000003SwmHQAS', '0051a000002UzQ0AAK'].includes(record['Op_Owner__c'])
            ? true
            : false,
        moCaseNumber: map(moCasesForRecord, (row) => row['CaseNumber']).join(', '),
        moCaseId: map(moCasesForRecord, (row) => row['Id']),
        moCaseBusinessVerticalDetails: map(
          moCasesForRecord,
          (row) => row['Business_Vertical_Details__c']
        ).join(','),
      }
    }),
    (row) => {
      return !row.moCaseBusinessVerticalDetails.toLowerCase().includes('retail')
    }
  )

  const inactiveCases = []

  for (let i = 0; i < allData.length; i++) {
    const active = await checkForActiveBaseRun(allData[i].caseId as string)

    if (!active)
      inactiveCases.push({
        ...omit(allData[i], ['moCaseBusinessVerticalDetails', 'moCaseId', 'attributes']),
        blockedMilestones: map(
          filter(moCasesMilestones, (moCaseMilestone) => {
            return allData[i].moCaseId.includes(moCaseMilestone['Case__c'])
          }),
          (row) => row['Milestone_Type__c']
        ).join(', '),
      })
  }

  return inactiveCases
}

export { fetchSFDCReportData }
