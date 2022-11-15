import { includes, intersection, merge } from 'lodash/fp'

import { BOT } from '../../external/slack'
import {
  assigneeEmail,
  assigneeId,
  assigneeName,
  assigneeSlackUserMention,
  assigneeSlackUsername,
  clientEmail,
  clientId,
  clientName,
  companyId,
  companyName,
  currentDate,
  instanceDeadline,
  instanceId,
  instanceLink,
  instanceName,
  instanceQuoteAmount,
  ownerEmail,
  ownerId,
  ownerName,
  ownerSlackUserMention,
  ownerSlackUsername,
  processId,
  processName,
  qaAssigneeEmail,
  qaAssigneeId,
  qaAssigneeName,
  qaMessage,
  qaSlackUserMention,
  qaSlackUsername,
} from '../../external/slack/dal'
import { extractVariableNamesFromTemplate, Mustache } from './mustache'

const slackMessageVars = {}

type TSlackMessageVarsPrerender = {
  qaAssignee?: {
    slackMention?: string
  }
  delegation?: {
    slackLink?: string
  }
}

const preRenderSlackMessageVars = async ({
  stepRunId,
  templateString,
  bot = BOT,
}: {
  stepRunId: number
  templateString: string
  bot?: any
}): Promise<TSlackMessageVarsPrerender> => {
  const mustacheVarNames = extractVariableNamesFromTemplate(templateString)
  const ret: Record<string, any> = {}

  if (
    intersection(
      [
        'assignee.email',
        'assignee.id',
        'assignee.name',
        'assignee.slackMention',
        'assignee.slackUsername',
      ],
      mustacheVarNames
    ).length > 0
  ) {
    ret.assignee = {
      id: await assigneeId(stepRunId),
      email: await assigneeEmail(stepRunId),
      name: await assigneeName(stepRunId),
      slackMention: await assigneeSlackUserMention(stepRunId, bot),
      slackUsername: await assigneeSlackUsername(stepRunId, bot),
    }
  }

  if (intersection(['client.email', 'client.id', 'client.name'], mustacheVarNames).length > 0) {
    ret.client = {
      id: await clientId(stepRunId),
      email: await clientEmail(stepRunId),
      name: await clientName(stepRunId),
    }
  }

  if (intersection(['company.id', 'company.name'], mustacheVarNames).length > 0) {
    ret.company = {
      id: await companyId(stepRunId),
      name: await companyName(stepRunId),
    }
  }

  if (
    intersection(
      [
        'delegation.id',
        'delegation.deadline',
        'delegation.name',
        'delegation.quoteAmount',
        'delegation.slackLink',
      ],
      mustacheVarNames
    ).length > 0
  ) {
    ret.delegation = {
      id: await instanceId(stepRunId),
      deadline: await instanceDeadline(stepRunId),
      name: await instanceName(stepRunId),
      quoteAmount: await instanceQuoteAmount(stepRunId),
      slackLink: await instanceLink(stepRunId),
    }
  }

  if (
    intersection(
      ['owner.email', 'owner.id', 'owner.name', 'owner.slackMention', 'owner.slackUsername'],
      mustacheVarNames
    ).length > 0
  ) {
    ret.owner = {
      id: await ownerId(stepRunId),
      email: await ownerEmail(stepRunId),
      name: await ownerName(stepRunId),
      slackMention: await ownerSlackUserMention(stepRunId, bot),
      slackUsername: await ownerSlackUsername(stepRunId, bot),
    }
  }

  if (intersection(['process.id', 'process.name'], mustacheVarNames).length > 0) {
    ret.process = {
      id: await processId(stepRunId),
      name: await processName(stepRunId),
    }
  }

  if (
    intersection(
      [
        'qaAssignee.email',
        'qaAssignee.id',
        'qaAssignee.name',
        'qaAssignee.slackMention',
        'qaAssignee.slackUsername',
      ],
      mustacheVarNames
    ).length > 0
  ) {
    ret.qaAssignee = {
      id: await qaAssigneeId(stepRunId),
      email: await qaAssigneeEmail(stepRunId),
      name: await qaAssigneeName(stepRunId),
      slackMention: await qaSlackUserMention(stepRunId, bot),
      slackUsername: await qaSlackUsername(stepRunId, bot),
    }
  }

  if (includes('currentDate', mustacheVarNames)) {
    ret.currentDate = await currentDate()
  }

  if (includes('qaMessage', mustacheVarNames)) {
    ret.qaMessage = await qaMessage(stepRunId, bot)
  }

  return ret
}

const renderSlackMessage = ({
  templateString,
  view = {},
}: {
  templateString: string
  view?: Record<string, any>
}) => Mustache.render(templateString, { ...slackMessageVars, ...view })

const fullRenderSlackMessage = async ({
  stepRunId,
  templateString,
  view = {},
}: {
  stepRunId: number
  templateString: string
  view?: Record<string, any>
}) => {
  const preRenderVars = await preRenderSlackMessageVars({ stepRunId, templateString })
  return renderSlackMessage({ templateString, view: merge(preRenderVars, view) })
}

export { fullRenderSlackMessage, preRenderSlackMessageVars, renderSlackMessage }
