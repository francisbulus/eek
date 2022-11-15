// import { oneLineTrim } from 'common-tags'
import { oneLineTrim } from 'common-tags'
import { get, last, map, sum } from 'lodash/fp'
import superagent, { SuperAgentRequest } from 'superagent'
import superagentProxy from 'superagent-proxy'

import {
  BRIGHTDATA_PASSWORD,
  BRIGHTDATA_USERNAME,
  GEOSURF_PASSWORD,
  GEOSURF_USERNAME,
  INV_PROXY_PASSWORD,
  INV_PROXY_USERNAME,
  SOAX_PASSWORD,
  SOAX_USERNAME,
} from '../config/env'

const PROXY_SERVICES = {
  BRIGHTDATA: 'brightdata',
  GEOSURF: 'geosurf',
  SOAX: 'soax',
} as const

type TProxyService = typeof PROXY_SERVICES[keyof typeof PROXY_SERVICES]
type TProxyWeightsObject = Record<TProxyService, number>

// Change these to change the default probability of using each proxy
const DEFAULT_WEIGHTS: TProxyWeightsObject = {
  [PROXY_SERVICES.BRIGHTDATA]: 7,
  [PROXY_SERVICES.GEOSURF]: 3,
  [PROXY_SERVICES.SOAX]: 0,
} as const

superagentProxy(superagent as any)

type TSuperagentWithProxy = SuperAgentRequest & {
  proxy: (url: string) => SuperAgentRequest
}

const INV_PROXY_BASE_URL = `http://${INV_PROXY_USERNAME}:${INV_PROXY_PASSWORD}@proxy.inv.tech`

const randomInt = (max = 99999999) => Math.floor(Math.random() * max)

interface IWeight {
  weight: number
  val: any
}

/**
 * Weights will add up to 1 after being normalized
 */
const normalizeWeights = (weights: IWeight[]): IWeight[] => {
  const weightSum = sum(map(get('weight'), weights))
  return map(
    (weight: IWeight) => ({
      weight: (weight.weight * 1.0) / weightSum,
      val: weight.val,
    }),
    weights
  )
}

const weightedRandomElement = (weights: IWeight[]) => {
  const normalizedWeights = normalizeWeights(weights)
  const r = Math.random()
  let s = 0
  for (const w of normalizedWeights) {
    s += w.weight
    if (r <= s) return w.val
  }
  return last(weights)!.val
}

const brightdataDirectUrl = (sessionId?: string) => {
  const sess = sessionId ?? randomInt()
  const ret = oneLineTrim`
    http://lum-customer-
    ${BRIGHTDATA_USERNAME}-
    zone-residential-
    country-us-
    dns-remote-
    session-${sess}:
    ${BRIGHTDATA_PASSWORD}@zproxy.lum-superproxy.io:22225
  `
  return ret
}

const geosurfDirectUrl = (sessionId?: string) => {
  const sess = sessionId ?? randomInt()
  const ret = oneLineTrim`
    http://${GEOSURF_USERNAME}+US+
    ${GEOSURF_USERNAME}-${sess}:${GEOSURF_PASSWORD}
    @us-1m.geosurf.io:8000
  `
  return ret
}

const soaxDirectUrl = (sessionId?: string) => {
  const sess = sessionId ?? randomInt()
  const ret = oneLineTrim`
    http://${SOAX_USERNAME}+US+
    ${SOAX_USERNAME}-${sess}:${SOAX_PASSWORD}
    @proxy.soax.com:9000
  `
  return ret
}

const geosurfUrl = () => `${INV_PROXY_BASE_URL}:24001`
const brightdataUrl = () => `${INV_PROXY_BASE_URL}:24000`
const soaxdataUrl = () => `${INV_PROXY_BASE_URL}:24002`

interface IProxyUrlObject {
  service: TProxyService
  proxyUrl: string
  ipUrl: string
  sessionHeader: [string, string]
}

const getProxyWeights = (weights?: TProxyWeightsObject): TProxyWeightsObject =>
  weights ? weights : DEFAULT_WEIGHTS

const randomProxyUrl = ({
  weights,
  sessionId = undefined,
}: {
  weights?: TProxyWeightsObject
  sessionId?: string
} = {}): IProxyUrlObject => {
  const actualWeights = getProxyWeights(weights)
  const sess = sessionId ?? `inv-${randomInt()}`
  const weightedElements = [
    {
      weight: actualWeights[PROXY_SERVICES.BRIGHTDATA],
      val: {
        service: PROXY_SERVICES.BRIGHTDATA,
        proxyUrl: brightdataUrl(),
        ipUrl: 'http://lumtest.com/myip.json',
        sessionHeader: ['x-lpm-session', `${sess}`],
        proxyBaseUrl: INV_PROXY_BASE_URL,
        port: 24000,
      },
    },
    {
      weight: actualWeights[PROXY_SERVICES.GEOSURF],
      val: {
        service: PROXY_SERVICES.GEOSURF,
        proxyUrl: geosurfUrl(),
        ipUrl: 'http://geo.geosurf.io',
        sessionHeader: ['X-session', `${GEOSURF_USERNAME}-${sess}`],
        proxyBaseUrl: INV_PROXY_BASE_URL,
        port: 24001,
      },
    },
    {
      weight: actualWeights[PROXY_SERVICES.SOAX],
      val: {
        service: PROXY_SERVICES.SOAX,
        proxyUrl: soaxdataUrl(),
        ipUrl: 'http://lumtest.com/myip.json', // soax does not have a test url but this works
      },
    },
  ]
  return weightedRandomElement(weightedElements)
}

const proxiedSuperagent = ({
  sup,
  sessionId,
  proxyUrl,
}: {
  sup: TSuperagentWithProxy
  sessionId?: string
  proxyUrl?: string
}) => {
  if (proxyUrl) {
    return sup.proxy(proxyUrl)
  } else {
    const { proxyUrl } = randomProxyUrl({ sessionId })
    return sup.proxy(proxyUrl)
  }
}

export {
  brightdataDirectUrl,
  brightdataUrl,
  geosurfDirectUrl,
  geosurfUrl,
  normalizeWeights,
  proxiedSuperagent,
  randomInt,
  randomProxyUrl,
  soaxdataUrl,
  soaxDirectUrl,
  superagent,
  weightedRandomElement,
}

export type { IProxyUrlObject, TProxyService, TProxyWeightsObject, TSuperagentWithProxy }
