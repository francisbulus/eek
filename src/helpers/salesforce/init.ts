import { establishConnection, TSFDCOrg } from '../../config/salesforce'

// USING jsforce library to inteegrate with SFDC: https://jsforce.github.io/document/

const establishSFDCConnection = async (client: TSFDCOrg) => {
  return await establishConnection(client)
}

export { establishSFDCConnection }
