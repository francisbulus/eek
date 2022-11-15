import { filter, map, omit } from 'lodash'
import pMap from 'p-map'

import { checkForActiveBaseRun } from '../../../../external/doordash/coo/helpers'
import { establishSFDCConnection } from '../../../../helpers/salesforce/init'

const importData = async () => {
  const connection = await establishSFDCConnection('doordash')

  const queryPayload = await connection
    .sobject('Opportunity')
    .find()
    .select('Id, POS_Integration_Type__c, RecordTypeId, Contract_Notes__c')
    .where(
      `
    CloseDate >= LAST_N_DAYS:30 
    AND Type = 'Change Of Ownership'
    AND RealZip__RealZip_Country__c = 'United States'
    AND (StageName = 'Ready for Signature' OR StageName = 'Closed Won' OR StageName= 'Out for Signature'
    OR StageName = 'Contract Signed' OR StageName = 'Out for Approvals')
    AND (NOT Name LIKE '%Chick-fil-a%') AND (NOT Name LIKE '%Jack in the box%') AND (NOT Name LIKE '%Jack-in-the-box%')
    AND (NOT Name LIKE '%Arby%') AND (NOT Name LIKE '%Firehouse%') AND (NOT Name LIKE '%Jimmy%') AND (NOT Name LIKE '%Sonic%') 
    AND (Deck_Rank_CW__c = 'Ace of Spades' OR Deck_Rank_CW__c = 'King of Spades')
    `
    )
    .sort({ CloseDate: -1 })
    .execute()

  const recordTypes = await connection
    .sobject('RecordType')
    .find()
    .select('Id')
    .where("Name = 'Marketplace' OR Name = 'Enterprise Marketplace'")
    .execute()

  const filteredPayload = map(
    filter(queryPayload, (record: any) => {
      return record.Contract_Notes__c !== 'COO Merge Complete'
    }),
    (record: any) => {
      return map(recordTypes, (type: any) => type.Id as string).includes(record.RecordTypeId)
        ? {
            ...omit(record, [
              'attributes',
              'Contract_Notes__c',
              'RecordTypeId',
              'POS_Integration_Type__c',
            ]),
            Type: record.POS_Integration_Type__c,
            Id: record.Id as string,
          }
        : null
    }
  )
  const inactiveCases: { 'Opportunity ID': string; Type: string }[] = []

  await pMap(
    filteredPayload,
    async (record) => {
      const active = await checkForActiveBaseRun(record?.Id as string)

      if (!active)
        inactiveCases.push({
          ...omit(record, ['Id']),
          'Opportunity ID': record?.Id as string,
        })
    },
    { concurrency: 1 }
  )

  return inactiveCases
}

export { importData }
