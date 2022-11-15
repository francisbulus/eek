import { hasRole } from '@invisible/heimdall'
import logger from '@invisible/logger'
import { VercelRequest, VercelResponse } from '@vercel/node'
import type JiraApi from 'jira-client'
import { compact, flatten, flow, identity, isEmpty, join, keys, map, pickBy } from 'lodash/fp'
import pMap from 'p-map'
import * as yup from 'yup'

import { init, JIRA_URL_REGEX } from '../../config/jira'
import { STEP_RUN_STATUSES } from '../../constants'
import { handleError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'
import {
  manipulateFiltersForProject,
  PROJECT_LANGUAGE_COUNTRY_MAP,
  uploadAttachmentsToGoogleDrive,
} from './delete-me'
import { IFilters, IIssue, IJiraTicket } from './types'

// Modify these to match the definitions in ./handler
const stringOrStringInArraySchema = yup.lazy((value) =>
  (!value || typeof value === 'string'
    ? yup.string()
    : yup.object().shape({ in: yup.array().of(yup.string()) })
  ).optional()
)
const inputYupSchema = yup
  .object({
    projects: yup.array().of(yup.string()).required(),
    jiraUrl: yup.string().matches(JIRA_URL_REGEX, { message: 'Invalid JIRA URL' }).required(),
    fields: yup.array().of(yup.string()).required(),
    driveFolderKey: yup.string().optional(),
    filters: yup
      .object()
      .shape({
        status: stringOrStringInArraySchema,
        assignee: stringOrStringInArraySchema,
        labels: stringOrStringInArraySchema,
      })
      .optional(),
  })
  .required()

const outputYupSchema = yup
  .object({
    jiraTickets: yup.array().of(yup.object()).required(),
  })
  .required()

const eqOrInString = (filters: IFilters) => (key: keyof IFilters) => {
  const filter = filters[key]
  if (typeof filter === 'string') return `${key} = "${filter}"`
  if (filter?.in) return `${key} IN (${filter.in.map((i) => `"${i}"`).join(', ')})`
  if (filter?.not_in)
    return `(${key} IS NULL OR ${key} NOT IN (${filter.not_in.map((i) => `"${i}"`).join(', ')}))`
  logger.warn('[jira-import]: Invalid filter', key)
  return ''
}
const geIFilterString = (filters: IFilters = {}) =>
  flow(pickBy(identity), keys, map(eqOrInString(filters)), join(' AND '))(filters)

const getTicketsForProject = (
  jira: JiraApi,
  options: { fields: string[]; filters?: IFilters }
) => async (project: string): Promise<IJiraTicket[]> => {
  const { fields, filters } = options
  const newFilters = manipulateFiltersForProject(project, filters as IFilters)

  const query = isEmpty(newFilters)
    ? `project = ${project}`
    : `project = ${project} AND ${geIFilterString(newFilters)}`

  const { issues, errorMessage } = (await jira.searchJira(query, {
    maxResults: 1000,
    fields,
  })) as { issues: IIssue<string>[]; errorMessage?: string }

  if (errorMessage) {
    throw new Error(`Error fetching JIRA tickets. Message: ${errorMessage}`)
  }

  return flow(
    map((issue: IIssue<string>) => ({
      id: issue.key,
      ...issue.fields,
      assignee: issue.fields.assignee?.displayName,
      priority: issue.fields.priority?.name,
      status: issue.fields.status?.name,
      url: `https://${(jira as any).host}/browse/${issue.key}`,
      language:
        PROJECT_LANGUAGE_COUNTRY_MAP[project as keyof typeof PROJECT_LANGUAGE_COUNTRY_MAP].language,
      customfield_10037:
        PROJECT_LANGUAGE_COUNTRY_MAP[project as keyof typeof PROJECT_LANGUAGE_COUNTRY_MAP].country, // customfield_10037 = country
    })),
    compact
  )(issues)
}

const importJiraTickets = async ({
  jiraUrl,
  projects,
  fields,
  filters,
  driveFolderKey,
}: {
  jiraUrl: string
  fields: string[]
  projects: string[]
  filters?: IFilters
  driveFolderKey?: string
}): Promise<{ jiraTickets: IJiraTicket[] }> => {
  const jira = await init(jiraUrl)

  const getTickets = getTicketsForProject(jira, { fields, filters })

  const jiraTickets = await pMap(projects, getTickets, { concurrency: 5 }).then(flatten)

  // This needs to be removed. This is bolt-specific code. We need to switch to upload to a S3/GCP bucket rather than google drive.
  if (driveFolderKey) return uploadAttachmentsToGoogleDrive(jiraTickets, driveFolderKey, jiraUrl)

  return { jiraTickets }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> =>
  hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      // Validating the inputs
      const inputData = inputYupSchema.validateSync(req.body.data)

      const output = await importJiraTickets(inputData)

      const outputData = outputYupSchema.cast(output)

      res.send({
        stepRunId,
        token,
        data: outputData,
        status: STEP_RUN_STATUSES.DONE,
      })
    } catch (err: any) {
      handleError({ err, req, res })
    }
  })
