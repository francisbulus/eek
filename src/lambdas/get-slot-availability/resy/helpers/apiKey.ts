import cheerio from 'cheerio'
import { trim } from 'lodash'
import { get } from 'lodash/fp'

import { ValidationError } from '../../../../helpers/errors'
import { seatedRedis } from '../../config/redis'
import { IValidResyBusiness } from '../../helpers/types'
import { resyRequest } from './request'

/**
 * Retrieves the raw HTML string of a restaurant page on resy
 * id is for a Business in our database
 */
const getResyRestaurantPageHtml = async (business: IValidResyBusiness) => {
  const ret = await resyRequest({ url: business.url }).then(get('text'))
  if (!ret) {
    const err = `Could not retrieve restaurant page HTML for resy, for getting api key`
    throw new ValidationError(err, { business })
  }
  return ret
}

/**
 * Given a raw HTML string of a restaurant page on resy, retrieve the URL of the main js file
 */
const getResyMainJsUrl = (raw: string) => {
  const $ = cheerio.load(raw as string, { xml: { normalizeWhitespace: true } } as any)
  const scriptSrc = get('0.attribs.src')($('script[src^="modules/app."]'))
  if (!scriptSrc) {
    const err = `Resy changed their page structure, cannot retrieve main js for api key`
    throw new ValidationError(err, { raw })
  }
  return `https://resy.com/${scriptSrc}`
}

/**
 * Retrieves the main js file for resy
 */
const getResyMainJsContent = async (url: string) => {
  const js = await resyRequest({ url })
  if (!js?.body) {
    throw new ValidationError(`Could not retrieve resy main js from url`, { url })
  }
  return js.body.toString() as string
}

/**
 * Given the raw js of the main js file for resy, retrieve the internal apiKey
 */
const getApiKeyFromMainJs = (rawJs: string) => {
  const matches = rawJs.match(/apiKey:"(.*?)"/gm)
  if (!matches?.[0]) {
    throw new ValidationError(`Could not retrieve resy api key from raw js`, { rawJs })
  }
  const firstMatch = matches[0]
  const ret = trim(firstMatch.substring(7, 9999), `"'`)
  if (!ret && ret.length > 3) {
    throw new ValidationError(`Could not retrieve resy api key from regex`, {
      firstMatch,
      ret,
      matches,
    })
  }
  return ret
}

const RESY_API_KEY_KEY = 'resy-api-key'
const LATEST_RESY_API_KEY = 'VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5'

/**
 * Retrieves the latest api key from resy
 * Will throw an error if any step fails
 */
const refreshApiKey = async (business: IValidResyBusiness) => {
  const restaurantHtml = await getResyRestaurantPageHtml(business)
  const mainJsUrl = await getResyMainJsUrl(restaurantHtml)
  const mainJsContent = await getResyMainJsContent(mainJsUrl)
  const apiKey = getApiKeyFromMainJs(mainJsContent)

  await seatedRedis.set(RESY_API_KEY_KEY, apiKey)
  return apiKey
}

const resyApiKey = async (business: IValidResyBusiness) => {
  try {
    let ret = await seatedRedis.get(RESY_API_KEY_KEY)
    if (!ret) ret = await refreshApiKey(business)
    return ret ?? LATEST_RESY_API_KEY
  } catch {
    return LATEST_RESY_API_KEY
  }
}

export {
  getApiKeyFromMainJs,
  getResyMainJsContent,
  getResyMainJsUrl,
  getResyRestaurantPageHtml,
  refreshApiKey,
  resyApiKey,
}
