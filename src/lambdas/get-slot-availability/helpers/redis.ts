import { oneLineTrim } from 'common-tags'
import { map } from 'lodash/fp'
import type { Business } from 'prisma-seated'

import { seatedRedis } from '../config/redis'
import type { TProxyWeightsObject } from './proxy'

const PROXY_WEIGHTS_KEY = 'proxy_weights'

const batchPrefix = (batch_id: number) => `batch/${batch_id}`
const businessPrefix = (external_id: number) => `business/${external_id}`
const cohortPrefix = (cohort_external_id: number) => `cohort/${cohort_external_id}`
const businessPath = ({
  batch_id,
  external_id,
  cohort_external_id,
}: {
  batch_id: number
  cohort_external_id: number
  external_id: number
}) => oneLineTrim`
  ${batchPrefix(batch_id)}/
  ${cohortPrefix(cohort_external_id)}/
  ${businessPrefix(external_id)}
`

const EX = 120 * 60 // expiration in seconds

/**
 * Retrieves a business from redis
 */
const getBusiness = async ({
  batch_id,
  external_id,
  cohort_external_id,
}: {
  batch_id: number
  external_id: number
  cohort_external_id: number
}) => {
  const redisResult = await seatedRedis.get(
    businessPath({ batch_id, cohort_external_id, external_id })
  )
  if (!redisResult) return undefined
  return JSON.parse(redisResult) as Business
}

/**
 * Stores an array of businesses in redis, as individual keys
 */
const setBusinesses = async ({
  batch_id,
  businesses,
  cohort_external_id,
}: {
  batch_id: number
  businesses: Business[]
  cohort_external_id: number
}) => {
  await Promise.all(
    map(
      (biz) =>
        seatedRedis.set(
          businessPath({ batch_id, external_id: biz.external_id, cohort_external_id }),
          JSON.stringify(biz),
          'EX',
          EX
        ),
      businesses
    )
  )
}

/**
 * Stores a single business in redis
 */
const setBusiness = async ({
  batch_id,
  cohort_external_id,
  business,
}: {
  batch_id: number
  cohort_external_id: number
  business: Business
}) =>
  seatedRedis.set(
    businessPath({ batch_id, external_id: business.external_id, cohort_external_id }),
    JSON.stringify(business),
    'EX',
    EX
  )

const setProxyWeights = async (weights: TProxyWeightsObject) =>
  seatedRedis.set(PROXY_WEIGHTS_KEY, JSON.stringify(weights))

const getProxyWeights = async () => {
  const redisResult = await seatedRedis.get(PROXY_WEIGHTS_KEY)
  if (!redisResult) return undefined
  return JSON.parse(redisResult) as TProxyWeightsObject
}

const seatedRedisService = {
  setProxyWeights,
  getProxyWeights,
  getBusiness,
  setBusinesses,
  setBusiness,
} as const

export { businessPath, seatedRedisService }
