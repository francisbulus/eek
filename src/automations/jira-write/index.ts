import { hasRole } from '@invisible/heimdall'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { isEmpty } from 'lodash'
import { find, flow, identity, pickBy, uniq } from 'lodash/fp'
import * as yup from 'yup'

import { init, JIRA_ID_REGEX, JIRA_URL_REGEX } from '../../config/jira'
import { STEP_RUN_STATUSES } from '../../constants'
import { BusinessInstanceNotFound, handleError, ValidationError } from '../../helpers/errors'
import { validateBasics } from '../../helpers/yup'
import { handleBoltStuff } from './delete-me'

const inputYupSchema = yup.object({
  jiraId: yup.string().matches(JIRA_ID_REGEX, { message: 'Invalid JIRA ID' }).required(),
  jiraUrl: yup.string().matches(JIRA_URL_REGEX, { message: 'Invalid JIRA URL' }).required(),
  status: yup.string().optional(),
  assignee: yup.string().optional(),
  comment: yup.string().optional(),
  summary: yup.string().optional(),
  custom: yup.string().optional(),
  country: yup.string().optional(),
  menuType: yup.string().optional(),
  AirtableApiUrl: yup.string().optional(),
  ExternalNotes: yup.string().optional(),
  IsClone: yup.string().optional(),
  labels: yup.array().of(yup.string()).optional(),
})

const outputYupSchema = yup.object({
  data: yup.object().required(),
})

const updateJiraTicket = async ({
  jiraUrl,
  jiraId,
  ...data
}: {
  jiraId: string
  jiraUrl: string
  status?: string
  assignee?: string
  comment?: string
  summary?: string
  labels?: string[]
  custom?: string
}): Promise<{ data: Record<string, any> }> => {
  const jira = await init(jiraUrl)

  const result: Record<string, any> = {}

  if (flow(pickBy(identity), isEmpty)(data)) throw new ValidationError('No data provided')

  if (data.custom === 'bolt') {
    // bolt specific
    const issue = await jira.findIssue(jiraId)
    handleBoltStuff(issue, data)
  }

  if (data.comment) {
    // during testing we dont actually want this to update jira
    if (process.env.VERCEL_ENV === 'production' && !process.env.DISABLE_JIRA_UPDATES) {
      await jira.addComment(jiraId, data.comment)
    }
    result.comment = data.comment
  }

  if (data.summary) {
    // during testing we dont actually want this to update jira
    if (process.env.VERCEL_ENV === 'production' && !process.env.DISABLE_JIRA_UPDATES) {
      await jira.updateIssue(jiraId, { fields: { summary: data.summary } })
    }
    result.comment = data.comment
  }

  if (data.assignee) {
    const user = await jira.searchUsers({
      username: '', // deprecated but required in typescript
      query: `displayName = ${data.assignee}`,
    })
    if (!user) throw new BusinessInstanceNotFound({ name: data.assignee, by: 'displayName' })
    // during testing we dont actually want this to update jira
    if (process.env.VERCEL_ENV === 'production' && !process.env.DISABLE_JIRA_UPDATES) {
      await jira.updateIssue(jiraId, { fields: { assignee: { accountId: user[0].accountId } } })
    }
    result.assignee = data.assignee
  }

  if (data.labels) {
    const { fields } = await jira.findIssue(jiraId)
    const labels: string[] = uniq([...fields.labels, data.labels])
    await jira.updateIssue(jiraId, { fields: { labels } })
    result.labels = labels
  }

  if (data.status) {
    try {
      // eslint-disable-next-line no-warning-comments
      const { transitions } = await jira.listTransitions(jiraId)
      const transition = find((t: any) => {
        if (t.name === data.status) return t
        if (t.to.name === data.status) return t.to
      })(transitions) as Record<string, any>

      if (!transition) throw new BusinessInstanceNotFound({ name: data.status, by: 'name' })

      // during testing we dont actually want this to update jira
      if (process.env.VERCEL_ENV === 'production' && !process.env.DISABLE_JIRA_UPDATES) {
        await jira.transitionIssue(jiraId, { transition: transition.id })
      }
    } catch (e) {
      // Do nothing. Transition above will fail when the target column/status does not exist on the board.
      // This is a temporary fix to avoid Base Runs from being blocked. This try-catch can be removed once Retry/Skip functionality is added to MTC.
    }
    result.status = data.status
  }

  return { data: result }
}

export default async (req: VercelRequest, res: VercelResponse): Promise<void> =>
  hasRole(['lambda', 'nidavellir', 'manticore'])(req, res, async (err: unknown) => {
    try {
      if (err) throw err

      const { stepRunId, token } = validateBasics(req)

      const inputData = inputYupSchema.validateSync(pickBy(identity, req.body.data))

      const output = await updateJiraTicket(inputData)

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
