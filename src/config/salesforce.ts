import { Connection } from 'jsforce'
import { split } from 'lodash/fp'

import { lambda } from '../external/lambda'

// USING jsforce library to inteegrate with SFDC: https://jsforce.github.io/document/

export type TSFDCOrg = 'doordash' | 'grubhub'

type TSFDCCreds = {
  username: string
  password: string
  securityToken: string
}

export const establishConnection = async (org: TSFDCOrg) => {
  try {
    // SFDC Creds must be stored as a string containing username, password & securityToken as space separated values

    const sfdcCredsArr = await getCredentials(org)

    const sfdcCreds: TSFDCCreds = {
      username: sfdcCredsArr[0],
      password: sfdcCredsArr[1],
      securityToken: sfdcCredsArr[2],
    }

    const conn = new Connection({})
    await conn.login(sfdcCreds.username, sfdcCreds.password + sfdcCreds.securityToken)
    return conn
  } catch (err) {
    throw new Error(`Could not establish SFDC connection for ${org}.`)
  }
}

export const getCredentials = async (org: TSFDCOrg) => {
  try {
    return await lambda.getCredential(`sfdc-${org}`).then(split(' '))
  } catch (e) {
    throw new Error(`Could not find Salesforce credentials for ${org}.`)
  }
}
