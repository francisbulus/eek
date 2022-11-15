import logger from '@invisible/logger'
import axios from 'axios'

import { getURLsFromString } from '../../../helpers/common'
import type { BaseRun } from '../../../helpers/types'
import {
  DAMEJIDLO_SCRAPING_URL,
  FOODORA_SCRAPING_URL,
  GLOVO_SCRAPING_URL,
  JUMIAFOOD_SCRAPING_URL,
  MRDFOOD_SCRAPING_URL,
  PYSZNE_SCRAPING_URL,
  TAZZ_SCRAPING_URL,
  UBEREATS_SCRAPING_URL,
  WOLT_SCRAPING_URL,
} from './constants'
import { checkIfScrappedInfoMatches, updateRestaurantValues } from './helpers'
import type {
  DamejidloResponse,
  FoodoraResponse,
  GlovoResponseBody,
  JumiafoodResponse,
  MrDFoodResponse,
  PyszneResponse,
  TazzResponse,
  UbereatsResponse,
  WoltResponse,
} from './types'

const scrapeGlovo = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const glovoLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Glovo link: ${glovoLink}`)

  logger.info('Scrapping Glovo ...')

  const response = await axios.post<GlovoResponseBody>(GLOVO_SCRAPING_URL, {
    url: glovoLink,
  })

  if (!response) return logger.error(`Error while scraping Glovo: `, response)

  const { restaurantName, address, restaurantStatus, rating } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${address}`,
  })

  const glovoRating = Number(((Number((rating ?? '0').replace('%', '')) / 100) * 5).toFixed(1))

  await updateRestaurantValues(
    {
      restaurantName,
      address,
      restaurantStatus,
      rating: Number.isNaN(glovoRating) ? null : glovoRating,
      scrapped: true,
      matches,
    },
    'Glovo',
    baseRun
  )

  logger.info('Glovo Scraping ended.')
}

const scrapeWolt = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const woltLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Wolt link: ${woltLink}`)

  logger.info('Scrapping Wolt ...')

  const response = await axios
    .post<WoltResponse>(WOLT_SCRAPING_URL, {
      url: woltLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Wolt: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Wolt: `, response)

  const {
    restaurantName,
    address: { streetAddress, city },
    restaurantStatus,
    rating,
  } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${streetAddress} ${city}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address: `${streetAddress} ${city}`,
      restaurantStatus,
      rating: Number((((rating ?? 0) / 10) * 5).toFixed(2)),
      scrapped: true,
      matches,
    },
    'Wolt',
    baseRun
  )

  logger.info('Wolt Scraping ended.')
}

const scrapeDamejidlo = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const damejidloLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Damejidlo link: ${damejidloLink}`)

  logger.info('Scrapping Damejidlo ...')

  const response = await axios
    .post<DamejidloResponse>(DAMEJIDLO_SCRAPING_URL, {
      url: damejidloLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Damejidlo: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Damejidlo: `, response)

  const {
    restaurantName,
    address: { streetAddress, city },
    restaurantStatus,
    rating,
  } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${streetAddress} ${city}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address: `${streetAddress} ${city}`,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : rating,
      scrapped: true,
      matches,
    },
    'Damejidlo',
    baseRun
  )

  logger.info('Damejidlo Scraping ended.')
}

const scrapeFoodora = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const foodoraLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Foodora link: ${foodoraLink}`)

  logger.info('Scrapping Foodora ...')

  const response = await axios
    .post<FoodoraResponse>(FOODORA_SCRAPING_URL, {
      url: foodoraLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Foodora: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Foodora: `, response)

  const { restaurantName, address, restaurantStatus, rating } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${address}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : rating,
      scrapped: true,
      matches,
    },
    'Foodora',
    baseRun
  )

  logger.info('Foodora Scraping ended.')
}

const scrapeJumiafood = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const jumiafoodLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Jumiafood link: ${jumiafoodLink}`)

  logger.info('Scrapping Jumiafood ...')

  const response = await axios
    .post<JumiafoodResponse>(JUMIAFOOD_SCRAPING_URL, {
      url: jumiafoodLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Jumiafood: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Jumiafood: `, response)

  const { restaurantName, address, restaurantStatus, rating } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${address}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : rating,
      scrapped: true,
      matches,
    },
    'Jumiafood',
    baseRun
  )

  logger.info('Jumiafood Scraping ended.')
}

const scrapeMrDFood = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const mrDFoodLink = resultURLs ? resultURLs[0] : ''

  logger.info(`MrDFood link: ${mrDFoodLink}`)

  logger.info('Scrapping MrDFood ...')

  const response = await axios
    .post<MrDFoodResponse>(MRDFOOD_SCRAPING_URL, {
      url: mrDFoodLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping MrDFood: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping MrDFood: `, response)

  const {
    restaurantName,
    address: { street_name, street_number, suburb, town },
    restaurantStatus,
    rating,
  } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${street_number} ${street_name} ${suburb} ${town}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address: `${street_number} ${street_name} ${suburb} ${town}`,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : Number(rating?.toFixed(2)),
      scrapped: true,
      matches,
    },
    'MrDFood',
    baseRun
  )

  logger.info('MrDFood Scraping ended.')
}

const scrapePyszne = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const pyszneLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Pyszne link: ${pyszneLink}`)

  logger.info('Scrapping Pyszne ...')

  const response = await axios
    .post<PyszneResponse>(PYSZNE_SCRAPING_URL, {
      url: pyszneLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Pyszne: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Pyszne: `, response)

  const { restaurantName, address, restaurantStatus, rating } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${address}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : rating,
      scrapped: true,
      matches,
    },
    'Pyszne',
    baseRun
  )

  logger.info('Pyszne Scraping ended.')
}

const scrapeTazz = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const tazzLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Tazz link: ${tazzLink}`)

  logger.info('Scrapping Tazz ...')

  const response = await axios
    .post<TazzResponse>(TAZZ_SCRAPING_URL, {
      url: tazzLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Tazz: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Tazz: `, baseRun.id)

  const { restaurantName, address, restaurantStatus, rating } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${address?.fullAddress}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address: `${address?.fullAddress}`,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : rating,
      scrapped: true,
      matches,
    },
    'Tazz',
    baseRun
  )

  logger.info('Tazz Scraping ended.')
}

const scrapeUbereats = async ({
  hyperLink,
  baseRun,
  receivedName,
  receivedAddress,
}: {
  hyperLink: string
  baseRun: BaseRun
  receivedName: string
  receivedAddress: string
}) => {
  const resultURLs = getURLsFromString(hyperLink)

  const ubereatsLink = resultURLs ? resultURLs[0] : ''

  logger.info(`Ubereats link: ${ubereatsLink}`)

  logger.info('Scrapping Ubereats ...')

  const response = await axios
    .post<UbereatsResponse>(UBEREATS_SCRAPING_URL, {
      url: ubereatsLink,
    })
    .catch((err) => {
      logger.error(`Error while scraping Ubereats: ${err}`)
    })

  if (!response) return logger.error(`Error while scraping Ubereats: `, response)

  const { restaurantName, address, restaurantStatus, rating } = response.data

  const matches = await checkIfScrappedInfoMatches({
    receivedName,
    receivedAddress,
    restaurantName: `${restaurantName}`,
    address: `${address}`,
  })

  await updateRestaurantValues(
    {
      restaurantName,
      address,
      restaurantStatus,
      rating: Number.isNaN(rating) ? null : rating,
      scrapped: true,
      matches,
    },
    'Ubereats',
    baseRun
  )

  logger.info('Ubereats Scraping ended.')
}

export {
  scrapeDamejidlo,
  scrapeFoodora,
  scrapeGlovo,
  scrapeJumiafood,
  scrapeMrDFood,
  scrapePyszne,
  scrapeTazz,
  scrapeUbereats,
  scrapeWolt,
}
