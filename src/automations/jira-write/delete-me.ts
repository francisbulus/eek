// This is bolt specific logic and needs to be extracted into the process itself eventually

import { toLower } from 'lodash/fp'

const COUNTRY_STATUS_MAP = {
  Netherlands: 'API Link added',
  Lithuania: 'Admin account creation',
  Nigeria: 'Admin account creation',
  'South Africa': 'Admin account creation',
  Kenya: 'Admin account creation',
  Slovakia: 'Admin account creation',
  Sweden: 'Admin account creation',
  Croatia: 'Admin account creation',
  Estonia: 'Admin account creation',
  Cyprus: 'Admin account creation',
  Malta: 'Admin account creation',
  Ghana: 'Admin account creation',
  Latvia: 'Admin account creation',
  Czechia: 'Admin account creation',
  Ukraine: 'Admin account creation',
  Romania: 'Admin account creation',
  Portugal: 'Admin account creation',
  Poland: 'Admin account creation',
} as const

export const handleBoltStuff = (issue: Record<string, any>, data: Record<string, any>) => {
  let comment = ''
  if (data.airtableApiUrl && !data.isClone) {
    comment += `Airtable Link: ${data.airtableApiUrl}`
  }
  if (data.externalNotes) {
    comment += `\n\nNotes: ${data.externalNotes}`
  }

  if (data.country === 'Slovakia') {
    comment += '\n\n[~accountid:60cb39a3c90cb20068f88089]. '
    comment += '\n[~accountid:61096e48b704b40068fefc4c]. '
  }
  if (data.country === 'Cyprus') {
    comment += '\n\n[~accountid:62d5240139248e8689ea959d]. '
    comment += '\n[~accountid:61693afc9cdb9300721a6bc5]. '
  }

  if (data.country) {
    if (data.status === 'Done') {
      data.status =
        COUNTRY_STATUS_MAP[data.country as keyof typeof COUNTRY_STATUS_MAP] ?? data.status
      data.comment = comment

      if (data.country === 'Croatia') {
        data.summary = `${issue.fields.summary} - Menu Complete` // Croatia ticket summaries need "Menu Complete" added once complete
      }
    }
    if (data.status === 'In Progress') {
      if (
        [
          'Lithuania',
          'Nigeria',
          'South Africa',
          'Kenya',
          'Slovakia',
          'Sweden',
          'Croatia',
          'Estonia',
          'Cyprus',
          'Malta',
          'Ghana',
          'Latvia',
          'Czechia',
          'Ukraine',
          'Romania',
          'Portugal',
          'Poland',
        ].includes(data.country)
      ) {
        data.status = ''
        data.assignee = 'Marina Galeazzi' // Assigned to Marina from our team to avoid importing again
      }
    }
  }

  if (data.country === 'Portugal' && toLower(data.menuType) === 'update') {
    data.status = 'Groceries'
  }
}
