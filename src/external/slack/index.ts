import { find, get, toLower } from 'lodash/fp'
import mem from 'mem'
import Slack from 'slack'
import superagent from 'superagent'

import { SLACK_API_BOT_TOKEN } from '../../config/env'
import type { TSlackUser } from './types'

// @ts-expect-error -- This actually works
const BOT = new Slack({ token: SLACK_API_BOT_TOKEN })

const MEMOIZE_MS = 5000

const getAllConversations = mem(
  async (bot = BOT) => {
    let result = await bot.conversations.list({ limit: 1000 })
    let channels: any[] = result.channels

    while (Boolean(result?.response_metadata?.next_cursor)) {
      result = await bot.conversations.list({
        limit: 1000,
        cursor: result.response_metadata.next_cursor,
      })
      channels = [...channels, ...result.channels]
    }

    return channels
  },
  { maxAge: MEMOIZE_MS }
)

const getAllUsers = mem(
  async (bot = BOT): Promise<TSlackUser[]> => {
    let result = await bot.users.list({ limit: 1000 })
    let members: any[] = result.members

    while (Boolean(result?.response_metadata?.next_cursor)) {
      result = await bot.users.list({
        limit: 1000,
        cursor: result.response_metadata.next_cursor,
      })
      members = [...members, ...result.members]
    }

    return members
  },
  { maxAge: MEMOIZE_MS }
)

const getUserByEmail = async ({
  email,
  bot = BOT,
}: {
  email: string
  bot?: any
}): Promise<TSlackUser | undefined> => {
  const allUsers = await getAllUsers(bot)
  return find(
    (u: { profile: { email: string } }) => toLower(u.profile.email) === toLower(email),
    allUsers
  ) as TSlackUser | undefined
}

const sendSlackMessageViaWebhook = async ({
  username,
  messageContent,
  webhookUrl,
}: {
  username: string
  messageContent: string
  webhookUrl: string
}) => {
  const messageBody = JSON.stringify({ username, text: messageContent })
  return superagent
    .post(webhookUrl)
    .set('Accept', 'application/json')
    .send(messageBody)
    .then(get('body'))
}

const sendMessage = async ({
  channel,
  text,
  bot = BOT,
}: {
  channel: string
  text: string
  bot?: any
}) => bot.chat.postMessage({ channel, text })

const slackFormattedLink = ({ url, text }: { url: string; text: string }) => `<${url}|${text}>`

const slackFormattedMention = ({ slackUserId }: { slackUserId: string }) => `<@${slackUserId}>`

export {
  BOT,
  getAllConversations,
  getAllUsers,
  getUserByEmail,
  sendMessage,
  sendSlackMessageViaWebhook,
  slackFormattedLink,
  slackFormattedMention,
}
