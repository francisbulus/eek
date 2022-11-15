import logger from '@invisible/logger'
import { trim } from 'lodash'
import { get, indexOf, split } from 'lodash/fp'
import Url from 'url-parse'

import { ValidationError } from '../../../../helpers/errors'
import { PLATFORMS } from '../../helpers/types'
import { opentableRequest } from './request'

const PLATFORM_NAME = PLATFORMS.OPENTABLE

const getOpentableIdFromUrl = (url: string) => {
  // Types of urls
  // http://www.opentable.com/single.aspx?rid=49183
  // http://www.opentable.com/single.aspx?rid=49183,like
  // https://www.opentable.com/restref/client/?restref=000854
  // https://www.opentable.com/restref/client/?restref=000854,like
  // https://www.opentable.com/aurora-soho-reservations-new-york?restref=14140
  // https://www.opentable.com/restaurant/profile/1005211/reserve
  const trimmed = trim(trim(url), '/')
  const parsed = new Url(trimmed, true)

  if (parsed.query.rid && parsed.query.rid.match(/\d*/gm)?.[0]) {
    return parsed.query.rid.match(/\d*/gm)?.[0]
  }
  if (parsed.query.restref && parsed.query.restref.match(/\d*/gm)?.[0]) {
    return parsed.query.restref.match(/\d*/gm)?.[0]
  }
  const pieces = split('/', parsed.pathname)
  const idx = indexOf('profile', pieces)
  if (idx !== -1) return pieces[idx + 1]
  return
}

const getOpentableId = async (url: string) => {
  // Types of URLs
  // https://www.opentable.com/alibi-bar-and-lounge
  // https://www.opentable.com/r/dillons-boston

  const trimmed = trim(trim(url), '/')
  const url_id = getOpentableIdFromUrl(url)
  if (url_id) {
    return url_id
  }

  logger.info(`${PLATFORM_NAME}: scraping to get url_id`, { trimmed })

  const html = (await opentableRequest({
    url: trimmed,
    json: false,
    useProxy: true,
    apiKey: false,
  }).then(get('text'))) as string

  logger.info(`${PLATFORM_NAME}: got html for: ${trimmed}`)

  return getOpentableUrlIdFromHtml(html)
}

const getOpentableUrlIdFromHtml = (html: string) => {
  const matches = html.match(/"rid":(\d+)/m)
  if (!matches?.[1]) {
    throw new ValidationError(`Could not retrieve opentable url id from html`, { html })
  }

  return matches[1]
}

export { getOpentableId, getOpentableIdFromUrl, getOpentableUrlIdFromHtml }
