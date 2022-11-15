import { trim } from 'lodash'
import { Business } from 'prisma-seated'

import { ValidationError } from '../../../../helpers/errors'
import { opentableRequest } from './request'
import { opentableReservationUrl } from './url'

/**
 * Retrieves the raw HTML string of a restaurant page on open table
 * id is for a Business in our database
 */
const getOpentableReservationPageHtmlAndCookies = async ({
  business,
  sessionId,
}: {
  business: Business
  sessionId?: string
}) => {
  const url = opentableReservationUrl(business.url_id!)
  const resp = await opentableRequest({ url, sessionId, apiKey: false })
  const html = resp.text
  const cookie = 'set-cookie' in resp.headers ? resp.headers['set-cookie'][0] : ''
  if (!html) {
    const err = `Could not retrieve reservation page HTML for opentable, for getting api key`
    throw new ValidationError(err, { sessionId, business, url })
  }
  return {
    html,
    cookie,
  }
}

/**
 * Given the raw html page from opentable, retrieve the internal apiKey
 */
const getTokenFromHtmlBody = (html: string) => {
  const matches = html.match(/authToken":"(.*?)"/gm)
  if (!matches?.[0]) {
    throw new ValidationError(`Could not retrieve open table auth token from html`, { html })
  }

  return trim(matches[0].substring(12), `"`)
}

const opentableApiKeyAndCookies = async ({
  business,
  sessionId,
}: {
  business: Business
  sessionId?: string
}) => {
  const { html, cookie } = await getOpentableReservationPageHtmlAndCookies({ business, sessionId })
  const apiKey = getTokenFromHtmlBody(html)
  return {
    apiKey,
    cookie,
  }
}

export {
  getOpentableReservationPageHtmlAndCookies,
  getTokenFromHtmlBody,
  opentableApiKeyAndCookies,
}
