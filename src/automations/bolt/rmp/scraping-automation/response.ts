import pMap from 'p-map'

import { UUIDs } from '../../../../external/bolt/rmp/constants'
import {
  scrapeDamejidlo,
  scrapeFoodora,
  scrapeGlovo,
  scrapeJumiafood,
  scrapeMrDFood,
  scrapePyszne,
  scrapeTazz,
  scrapeUbereats,
  scrapeWolt,
} from '../../../../external/bolt/rmp/scrapers'
import type { Competitor } from '../../../../external/bolt/rmp/types'
import type { BaseRun } from '../../../../helpers/types'

const getCompetitorsToBeScrapped = async ({ baseRun }: { baseRun: BaseRun }) => {
  const competitors = {} as Record<Competitor, string>

  baseRun.baseRunVariables.forEach((brv) => {
    if (brv.baseVariableId === UUIDs.Competitors.Glovo && brv.value !== null && brv.value !== '') {
      competitors['Glovo'] = brv.value
    }

    if (brv.baseVariableId === UUIDs.Competitors.Wolt && brv.value !== null && brv.value !== '') {
      competitors['Wolt'] = brv.value
    }

    if (
      brv.baseVariableId === UUIDs.Competitors.Damejidlo &&
      brv.value !== null &&
      brv.value !== ''
    ) {
      competitors['Damejidlo'] = brv.value
    }

    if (
      brv.baseVariableId === UUIDs.Competitors.Foodora &&
      brv.value !== null &&
      brv.value !== ''
    ) {
      competitors['Foodora'] = brv.value
    }

    if (
      brv.baseVariableId === UUIDs.Competitors.Jumiafood &&
      brv.value !== null &&
      brv.value !== ''
    ) {
      competitors['Jumiafood'] = brv.value
    }

    if (
      brv.baseVariableId === UUIDs.Competitors.MrDFood &&
      brv.value !== null &&
      brv.value !== ''
    ) {
      competitors['MrDFood'] = brv.value
    }

    // if (brv.baseVariableId === UUIDs.Competitors.Pyszne && brv.value !== null && brv.value !== '') {
    //   competitors['Pyszne'] = brv.value
    // }

    if (brv.baseVariableId === UUIDs.Competitors.Tazz && brv.value !== null && brv.value !== '') {
      competitors['Tazz'] = brv.value
    }

    if (
      brv.baseVariableId === UUIDs.Competitors.Ubereats &&
      brv.value !== null &&
      brv.value !== ''
    ) {
      competitors['Ubereats'] = brv.value
    }
  })

  return competitors
}

const scrapeCompetitors = async ({
  competitors,
  baseRun,
}: {
  competitors: Record<Competitor, string>
  baseRun: BaseRun
}) => {
  await pMap(
    Object.keys(competitors),
    async (key) => {
      const restaurantName = baseRun.baseRunVariables.find(
        (brv) => brv.baseVariableId === UUIDs.BaseVariables.Restaurant.Name
      )?.value as string

      const restaurantAddress = baseRun.baseRunVariables.find(
        (brv) => brv.baseVariableId === UUIDs.BaseVariables.Restaurant.Address
      )?.value as string

      switch (key) {
        case 'Glovo':
          await scrapeGlovo({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Wolt':
          await scrapeWolt({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Damejidlo':
          await scrapeDamejidlo({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Foodora':
          await scrapeFoodora({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Jumiafood':
          await scrapeJumiafood({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'MrDFood':
          await scrapeMrDFood({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Pyszne':
          await scrapePyszne({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Tazz':
          await scrapeTazz({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        case 'Ubereats':
          await scrapeUbereats({
            hyperLink: competitors[key],
            baseRun,
            receivedName: restaurantName,
            receivedAddress: restaurantAddress,
          })

          break

        default:
          break
      }
    },
    { concurrency: 1, stopOnError: false }
  )
}

export { getCompetitorsToBeScrapped, scrapeCompetitors }
