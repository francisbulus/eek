import { filter, map, omit } from 'lodash'

import { checkForActiveBaseRun } from '../../../../external/doordash/coo/helpers'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'

const fetchSFDCReportData = async () => {
  const connection = await establishSFDCConnection('doordash')

  //   const skipNumber = 100 Can use pagination in future as maximum result length always returned by the query is <= 100

  const queryPayload = await connection
    .sobject('Opportunity')
    .find()
    .select('Id, Contract_Notes__c, RecordTypeId')
    .where(
      'CloseDate >= LAST_N_DAYS:7 ' +
        "AND Type = 'Change Of Ownership' AND RealZip__RealZip_Country__c = 'United States' " +
        "AND (NOT Name LIKE '%Chick-fil-a%') AND (NOT Name LIKE '%Jack in the box%') " +
        "AND (NOT Name LIKE '%Arby%') AND (NOT Name LIKE '%Firehouse%') AND (NOT Name LIKE '%Jimmy%') AND (NOT Name LIKE '%Sonic%') " +
        "AND (StageName = 'Ready for Signature' OR StageName = 'Closed Won' OR StageName= 'Out for Signature' " +
        "OR StageName = 'Contract Signed' OR StageName = 'Out for Approvals') " +
        "AND (Deck_Rank_CW__c = 'Ace of Spades' OR Deck_Rank_CW__c = 'King of Spades')"
    )
    .sort({ CloseDate: -1 })
    // .limit(100) Can equally set limit in future as maximum result length always returned by the query is <= 100
    // .skip(skipNumber ? skipNumber : 0)
    .execute()

  const recordTypes = await connection
    .sobject('RecordType')
    .find()
    .select('Id')
    .where("Name = 'Marketplace' OR Name = 'Enterprise Marketplace'")
    .execute()

  // The Contract_Notes__c field cannot be filtered or sorted in a query so we use a helper function to filter the value out

  const filteredPayload = map(
    filter(queryPayload, (record: any) => {
      return record.Contract_Notes__c !== 'COO Merge Complete'
    }),
    (record: any) => {
      return map(recordTypes, (type: any) => type.Id as string).includes(record.RecordTypeId)
        ? {
            ...omit(record, ['attributes', 'Contract_Notes__c', 'RecordTypeId']),
            Type: 'Others',
            Id: record.Id as string,
          }
        : null
    }
  )

  const inactiveCases = []

  for (let i = 0; i < filteredPayload.length; i++) {
    const active = await checkForActiveBaseRun(filteredPayload[i]?.Id as string)

    if (!active)
      inactiveCases.push({
        ...omit(filteredPayload[i], ['Id']),
        'Opportunity ID': filteredPayload[i]?.Id,
      })
  }

  return inactiveCases
}

export { fetchSFDCReportData }
