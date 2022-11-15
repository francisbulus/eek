import logger from '@invisible/logger'
import { trim } from 'lodash'
import { get, includes, last, split } from 'lodash/fp'

import { ValidationError } from '../../../../helpers/errors'
import { PLATFORMS } from '../../helpers/types'
import { yelpRequest } from './request'
import { yelpReservationUrl } from './url'

const PLATFORM_NAME = PLATFORMS.YELP

const yelpSlugFromUrl = (url: string) => {
  // https://www.yelp.com/reservations/the-harp-and-fiddle-park-ridge
  // https://www.yelp.com/biz/burkys-grill-myrtle-beach
  const u = trim(url)

  const pieces = includes('?', u)
    ? split('/', trim(split('?', u)[0], '/'))
    : split('/', trim(u, '/'))

  return last(pieces) as string
}

const getYelpUrlIdLatLong = async (url: string) => {
  const slug = yelpSlugFromUrl(url)
  const reservationUrl = yelpReservationUrl(slug)
  const html = (await yelpRequest({
    url: reservationUrl,
    json: false,
    useProxy: true,
    apiKey: false,
  }).then(get('text'))) as string

  logger.info(`${PLATFORM_NAME}: got html for ${reservationUrl}`)

  if (!html) {
    const err = `${PLATFORM_NAME}: Could not retrieve reservation html. This business might not allow reservations`
    throw new ValidationError(err, { url })
  }

  const url_id = getYelpUrlIdFromHtml(html)
  const { latitude, longitude } = getYelpLatitudeLongitudeFromHtml(html)

  return { url_id, latitude, longitude }
}

const getYelpUrlIdFromHtml = (html: string) => {
  const matches = html.match(/\\\"businessId\\\":[ \t]*\\\"(.*?)\\\"/m)
  if (!matches?.[1]) {
    throw new ValidationError(`${PLATFORM_NAME} Could not retrieve url id from html`, { html })
  }

  return matches[1]
}

const getYelpLatitudeLongitudeFromHtml = (html: string) => {
  const latMatches = html.match(/\\\"latitude\\\":[ \t]*([\d\.\-]*),/m)
  if (!latMatches?.[1]) {
    throw new ValidationError(`${PLATFORM_NAME}: Could not retrieve latitude from html`, { html })
  }

  const longMatches = html.match(/\\\"longitude\\\":[ \t]*([\d\.\-]*),/m)
  if (!longMatches?.[1]) {
    throw new ValidationError(`${PLATFORM_NAME}: Could not retrieve longitude from html`, { html })
  }

  return { latitude: parseFloat(latMatches[1]), longitude: parseFloat(longMatches[1]) }
}

export {
  getYelpLatitudeLongitudeFromHtml,
  getYelpUrlIdFromHtml,
  getYelpUrlIdLatLong,
  yelpSlugFromUrl,
}
