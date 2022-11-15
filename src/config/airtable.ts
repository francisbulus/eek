import { base, configure } from 'airtable'

import { lambda } from '../external/lambda'

export const establishAirtableConnection = async (client: string) => {
  const apiKey = await lambda.getCredential(`airtable-${client}`)

  configure({
    apiKey,
    endpointUrl: 'https://api.airtable.com',
  })
}

export const getAirtableBase = (baseId: string) => base(baseId)
