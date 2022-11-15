import { establishSFDCConnection } from '../../../../helpers/salesforce/init'

const fetchSFDCData = async ({ opportunityId }: { opportunityId: string }) => {
  const connection = await establishSFDCConnection('doordash')

  const oppBaseUrl = 'https://figment.lightning.force.com/lightning/r/Opportunity/'

  let accountName: string | null = null
  let accountURL: string | null = null

  const data = (await connection
    .sobject('Opportunity')
    .findOne()
    .where(`Id = '${opportunityId}'`)
    .select('Name, AccountId, StageName, Merchant_Supplied_ID__c')) as any

  if (data.AccountId) {
    const accountData = (await connection
      .sobject('Account')
      .findOne()
      .where(`Id = '${data.AccountId}'`)
      .select('Name, Account_URL__c')) as any

    accountName = accountData.Name
    accountURL = accountData.Account_URL__c
  }

  return {
    opportunityName: data.Name,
    opportunityURL: oppBaseUrl + `${opportunityId}/view`,
    opportunityStage: data.StageName,
    accountName,
    accountURL,
    msid: data.Merchant_Supplied_ID__c,
  }
}

export { fetchSFDCData }
