import { oneLineTrim } from 'common-tags'
import { trim } from 'lodash'
import { get, includes, split } from 'lodash/fp'

import { ValidationError } from '../../../../helpers/errors'
import { resyApiKey } from './apiKey'
import { resyRequest } from './request'

/**
 * Given a resy restaurant url, give the url for retrieving info about the venue
 * url must be like: https://resy.com/cities/mia/the-river-oyster-bar
 * unexpected results if not given a valid resy restaurant url
 */
const resyVenueUrl = (url: string) => {
  const u = trim(url)
  const pieces = includes('?', u)
    ? split('/', trim(split('?', u)[0], '/'))
    : split('/', trim(u, '/'))
  const location = pieces[pieces.length - 2]
  const url_slug = pieces[pieces.length - 1]
  return oneLineTrim`
    https://api.resy.com/3/venue?
    location=${location}&
    url_slug=${url_slug}
  `
}

/**
 * A clean url for the actual restaurant page on resy
 */
const resyRestaurantUrl = (url: string) => {
  const u = trim(url)
  const pieces = includes('?', u)
    ? split('/', trim(split('?', u)[0], '/'))
    : split('/', trim(u, '/'))
  const location = pieces[pieces.length - 2]
  const url_slug = pieces[pieces.length - 1]
  return `https://resy.com/cities/${location}/${url_slug}`
}

/**
 * Retrieves the url id of a resy restaurant from the web
 */
const getResyUrlId = async (url: string) => {
  const venueUrl = resyVenueUrl(url)
  const apiKey = await resyApiKey({ url } as any)
  const ret: string = await resyRequest({
    url: venueUrl,
    json: true,
    useProxy: true,
    apiKey,
  }).then(get('body.id.resy'))
  if (!ret) {
    const err = `Could not retrieve venue id for resy`
    throw new ValidationError(err, { url })
  }
  return `${ret}`
}

export { getResyUrlId, resyRestaurantUrl, resyVenueUrl }
