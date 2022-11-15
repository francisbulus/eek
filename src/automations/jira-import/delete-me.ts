/* eslint-disable no-warning-comments */
// This file should be deleted. This is bolt-specific code. We need to find a way to systematically get the language based on the country value in the the jira ticket.

import { isEmpty } from 'lodash/fp'
import pMap from 'p-map'

import { getCredentials } from '../../config/jira'
import { uploadToGDrive } from '../upload-google-drive'
import { IFilters, IJiraTicket } from './types'

export const PROJECT_LANGUAGE_COUNTRY_MAP = {
  SNO: { language: 'English', country: 'South Africa' },
  GNO: { language: 'English', country: 'Ghana' },
  KNO: { language: 'English', country: 'Kenya' },
  NNO: { language: 'English', country: 'Nigeria' },
  PNO: { language: 'Portuguese', country: 'Portugal' },
  SLOV: { language: 'Slovak', country: 'Slovakia' },
  CZC: { language: 'Czech', country: 'Czechia' },
  RNO: { language: 'Romanian', country: 'Romania' },
  CNO: { language: 'Croatian', country: 'Croatia' },
  PLN: { language: 'Polish', country: 'Poland' },
  NOR: { language: 'Norwegian', country: 'Norway' },
  DKM: { language: 'Danish', country: 'Denmark' },
  LNO: { language: 'Lithuanian', country: 'Lithuania' },
  LATVIA: { language: 'Latvian', country: 'Latvia' },
  UNO: { language: 'Ukrainian', country: 'Ukraine' },
  ENO: { language: 'Estonian', country: 'Estonia' },
  SWD: { language: 'Swedish', country: 'Sweden' },
  NET: { language: 'Dutch', country: 'Netherlands' },
  CPRS: { language: 'Greek', country: 'Cyprus' },
  MNO: { language: 'English', country: 'Malta' },
} as const

// TODO: make toHTML its own automation
const toHtml = (str = '') =>
  str
    .replace(/([^\n:]+:\s)/g, (match) => `<b>${match}</b>`)
    .replace(/https?:\/\/[^\s]+/g, (match) => `<a target="_blank" href="${match}">${match}</a>`)
    .replace(/\n/g, '<br>')

const addAttachmentToDescription = (description = '', uploadedFileUrls: string[]) =>
  `${description}\n\nATTACHMENTS:\n${uploadedFileUrls.join('\n')}`

export const uploadAttachmentsToGoogleDrive = async (
  jiraTickets: IJiraTicket[],
  driveFolderKey: string,
  jiraUrl: string
) => {
  const jiraOrg = jiraUrl.split('https://')[1].split('.')[0]
  const credentials = await getCredentials(jiraOrg)
  const token = Buffer.from(credentials.join(':')).toString('base64')

  return pMap(
    jiraTickets,
    async (ticket) => {
      const attachments = (ticket.attachment as unknown) as Record<string, string>[]
      const files = attachments.map((f) => ({
        fileName: f.filename as string,
        url: f.content as string,
      }))

      ticket.description = toHtml(ticket.description ?? '')

      if (isEmpty(files)) return ticket

      const { uploadedFileUrls } = await uploadToGDrive({
        fetchHeaders: {
          Authorization: `Basic ${token}`,
          Accept: 'application/json',
        },
        files,
        driveFolderKey,
      })

      return {
        ...ticket,
        description: addAttachmentToDescription(ticket.description, uploadedFileUrls),
      }
    },
    { concurrency: 1 }
  ).then((jiraTickets) => ({ jiraTickets }))
}

export const manipulateFiltersForProject = (project: string, filters: IFilters) => {
  const newFilters = JSON.parse(JSON.stringify(filters)) // Deep Cloning to ensure original Filters object is not manipulated

  if (!isEmpty(newFilters)) {
    if (project === 'PNO') {
      newFilters.assignee = { not_in: ['Marina Galeazzi'] }
    }
  }

  return newFilters
}
