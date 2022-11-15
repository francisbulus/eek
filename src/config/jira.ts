import JiraApi from 'jira-client'
import { split } from 'lodash/fp'

import { lambda } from '../external/lambda'

export const JIRA_URL_REGEX = /(https)\:\/\/\w+\.atlassian\.net(?!\/)/g
export const JIRA_ID_REGEX = /[A-Z]{2,}-\d+/g

export const init = async (jiraUrl: string) => {
  const host = jiraUrl.split('https://')[1]

  const org = host.split('.')[0]

  const [username, password] = await getCredentials(org)
  const args: JiraApi.JiraApiOptions = {
    protocol: 'https',
    host,
    username,
    password,
    apiVersion: '2',
    strictSSL: true,
  }
  return new JiraApi(args)
}

export const getCredentials = async (org: string) => {
  try {
    return await lambda.getCredential(`jira-${org}`).then(split(' '))
  } catch (e) {
    throw new Error(`Could not find JIRA credentials for ${org}.`)
  }
}
