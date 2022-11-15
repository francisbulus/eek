import { dalInstanceUrl } from '../../external/mimir/helpers'
import { StepRun } from '../../external/mimir/StepRun'
import { LONG_FORMAT, moment, TZ } from '../../helpers/moment'
import { BOT, getUserByEmail, slackFormattedLink, slackFormattedMention } from './index'

const instanceName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.processRun?.instance?.name
  if (!name) return 'No Instance found'

  return `${name}`
}

const instanceId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.processRun?.instance?.id
  if (!id) return 'No Instance found'

  return `${id}`
}

const instanceLink = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.processRun?.instance?.id
  const name = stepRun?.processRun?.instance?.name

  if (!id) {
    throw new Error(`Instance not found for stepRun: ${stepRunId}`)
  }

  const instanceUrl = dalInstanceUrl(id)
  return slackFormattedLink({ url: instanceUrl, text: name ?? 'dal link' })
}

const instanceDeadline = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const deadline = stepRun?.processRun?.instance?.deadline
  if (!deadline) return 'No deadline found'

  return moment.tz(deadline, TZ).format(LONG_FORMAT)
}

const instanceQuoteAmount = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const quoteAmount = stepRun?.processRun?.instance?.quote?.amountInCents
  if (!quoteAmount) return 'No Quote found'

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    quoteAmount / 100.0
  )
}

const assigneeName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.taskRun?.assignee?.profile?.name
  if (!name) return 'No Assignee found'

  return `${name}`
}

const assigneeId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.taskRun?.assignee?.id
  if (!id) return 'No Assignee found'

  return `${id}`
}

const assigneeEmail = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.taskRun?.assignee?.profile?.email
  if (!email) return 'No Assignee found'

  return `${email}`
}

const assigneeSlackUsername = async (stepRunId: number, bot = BOT) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.taskRun?.assignee?.profile?.email
  if (!email) return 'No Assignee found'

  const slackUser = await getUserByEmail({ email, bot })

  if (slackUser) {
    return `${slackUser?.name}`
  } else {
    return `No slack username found for email: ${email}`
  }
}

const assigneeSlackUserMention = async (stepRunId: number, bot = BOT) => {
  const stepRun = await StepRun.findById(stepRunId, false)
  const email = stepRun?.taskRun?.assignee?.profile?.email

  if (!email) return 'No Assignee found'
  const slackUser = await getUserByEmail({ email, bot })

  if (slackUser) {
    return slackFormattedMention({ slackUserId: slackUser.id })
  } else {
    return `No slack username found for email: ${email}`
  }
}

const qaAssigneeName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.taskRun?.qaAssignee?.profile?.name
  if (!name) return 'No QA Assignee found'

  return `${name}`
}

const qaAssigneeId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.taskRun?.qaAssignee?.id
  if (!id) return 'No QA Assignee found'

  return `${id}`
}

const qaAssigneeEmail = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.taskRun?.qaAssignee?.profile?.email
  if (!email) return 'No QA Assignee found'

  return `${email}`
}

const qaSlackUsername = async (stepRunId: number, bot = BOT) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.taskRun?.qaAssignee?.profile?.email
  if (!email) return 'No QA Assignee found'

  const slackUser = await getUserByEmail({ email, bot })

  if (slackUser) {
    return `${slackUser?.name}`
  } else {
    return `No slack username found for email: ${email}`
  }
}

const qaSlackUserMention = async (stepRunId: number, bot = BOT) => {
  const stepRun = await StepRun.findById(stepRunId, false)
  const email = stepRun?.taskRun?.qaAssignee?.profile?.email

  if (!email) return 'No QA Assignee found'
  const slackUser = await getUserByEmail({ email, bot })

  if (slackUser) {
    return slackFormattedMention({ slackUserId: slackUser.id })
  } else {
    return `No slack username found for email: ${email}`
  }
}

const companyName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.processRun?.instance?.assistant?.company?.name
  if (!name) return 'No Company found'

  return `${name}`
}

const companyId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.processRun?.instance?.assistant?.company?.id
  if (!id) return 'No Company found'

  return `${id}`
}

const ownerName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.processRun?.instance?.owner?.profile?.name
  if (!name) return 'No Owner found'

  return `${name}`
}

const ownerId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.processRun?.instance?.owner?.id
  if (!id) return 'No Owner found'

  return `${id}`
}

const ownerEmail = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.processRun?.instance?.owner?.profile?.email
  if (!email) return 'No Owner found'

  return `${email}`
}

const ownerSlackUsername = async (stepRunId: number, bot = BOT) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.processRun?.instance?.owner?.profile?.email
  if (!email) return 'No Owner found'

  const slackUser = await getUserByEmail({ email, bot })

  if (slackUser) {
    return `${slackUser?.name}`
  } else {
    return `No slack username found for email: ${email}`
  }
}

const ownerSlackUserMention = async (stepRunId: number, bot = BOT) => {
  const stepRun = await StepRun.findById(stepRunId, false)
  const email = stepRun?.processRun?.instance?.owner?.profile?.email

  if (!email) return 'No Owner found'
  const slackUser = await getUserByEmail({ email, bot })

  if (slackUser) {
    return slackFormattedMention({ slackUserId: slackUser.id })
  } else {
    return `No slack username found for email: ${email}`
  }
}

const clientName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.processRun?.instance?.client?.profile?.name
  if (!name) return 'No Client found'

  return `${name}`
}

const clientId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.processRun?.instance?.client?.id
  if (!id) return 'No Client found'

  return `${id}`
}

const clientEmail = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const email = stepRun?.processRun?.instance?.client?.profile?.email
  if (!email) return 'No Client found'

  return `${email}`
}

const processName = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const name = stepRun?.processRun?.process?.name
  if (!name) return 'No Process found'

  return `${name}`
}

const processId = async (stepRunId: number) => {
  const stepRun = await StepRun.findById(stepRunId, false)

  const id = stepRun?.processRun?.process?.id
  if (!id) return 'No Process found'

  return `${id}`
}

const currentDate = () => moment.tz(moment(), TZ).format(LONG_FORMAT)

const qaMessage = async (stepRunId: number, bot = BOT) => {
  const slackUserMention = await qaSlackUserMention(stepRunId, bot)
  const itcLink = await instanceLink(stepRunId)

  return `This delegation is ready for QA: ${itcLink} ${slackUserMention}`
}

export {
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
}
