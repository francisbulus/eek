import logger from '@invisible/logger'
import { trim } from 'lodash'
import { get, includes, indexOf, split } from 'lodash/fp'

import { ValidationError } from '../../../../helpers/errors'
import { PLATFORMS } from '../../helpers/types'
import { sevenroomsRequest } from './request'

const PLATFORM_NAME = PLATFORMS.SEVENROOMS

const getSevenroomsIdFromUrl = (url: string) => {
  const u = trim(url)
  const pieces = includes('?', u)
    ? split('/', trim(split('?', u)[0], '/'))
    : split('/', trim(u, '/'))

  const idx = indexOf('reservations', pieces)

  const ret = pieces[idx + 1]
  if (!ret) throw new ValidationError(`${PLATFORMS.SEVENROOMS}`)
  return ret
}

/**
 * Retrieves the url id of a sevenrooms restaurant from the webpage
 */
const getSevenroomsId = async (url: string) => {
  const trimmed = trim(trim(url), '/')

  logger.info(`${PLATFORM_NAME}: scraping to get url_id`, { trimmed })

  const html = (await sevenroomsRequest({
    url: trimmed,
    json: false,
    useProxy: true,
    apiKey: false,
  }).then(get('text'))) as string

  logger.info(`${PLATFORM_NAME}: got html for: ${trimmed}`)

  return getSevenroomsUrlIdFromHtml(html)
}

const getSevenroomsUrlIdFromHtml = (html: string) => {
  const matches = html.match(/id: "([a-z]+)"/m)
  if (!matches?.[1]) {
    throw new ValidationError(`Could not retrieve sevenrooms url id from html`, { html })
  }

  return matches[1]
}

export { getSevenroomsId, getSevenroomsIdFromUrl, getSevenroomsUrlIdFromHtml }
