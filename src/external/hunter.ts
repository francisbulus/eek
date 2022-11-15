import logger from '@invisible/logger'
import HunterSDK from 'hunterio'
import {
  filter,
  flatten,
  flow,
  identity,
  isString,
  map,
  mapKeys,
  pick,
  replace,
  sortBy,
  toLower,
} from 'lodash/fp'
import pThrottle from 'p-throttle'
import { promisify } from 'util'

import { HUNTER_TOKEN } from '../config/env'
import { IRow, ITable } from '../helpers/arrays'

/**
 * From Giovanni from Hunter email:
 * For the Domain Search API we have a limit of 15 requests per second.
 * The Email Verifier and Email Finder API are rate limited to 300 requests per minute,
 * with bursts of 10 requests per second.
 */

const QUERIES_PER_SECOND = 4
const SECOND_IN_MS = 1000

const hunter = new HunterSDK(HUNTER_TOKEN)

const pDomainSearch = promisify(hunter.domainSearch).bind(hunter)
const pEmailFinder = promisify(hunter.emailFinder).bind(hunter)
const pEmailVerifier = promisify(hunter.emailVerifier).bind(hunter)

const throttle = pThrottle({
  limit: QUERIES_PER_SECOND,
  interval: SECOND_IN_MS,
})

const throttledDomainSearch = throttle(pDomainSearch)
const throttledEmailFinder = throttle(pEmailFinder)
const throttledEmailVerifier = throttle(pEmailVerifier)

interface IHunterDomainsArgs extends IRow {
  domain: string
  department?: string
}

interface IEmail {
  value: string
  type: string
  confidence: number
  seniority: string
  department: string
  first_name: string
  last_name: string
  position: string
  linkedin: string
  twitter: string
  phone_number: string
}

interface IHunterDomainsResult extends IEmail {
  domain: string
}

const getEmailsForDomains = async ({ table }: { table: IHunterDomainsArgs[] }) => {
  // Just in case the input is not clean
  const filterDomains = flow(
    map((row: IRow) => mapKeys((key: string) => flow(toLower, replace(' ', ''))(key), row)),
    filter(({ domain }: { domain: string | undefined | null }) => isString(domain)),
    sortBy(identity)
  )(table)

  const results = await Promise.all(map((row) => throttledDomainSearch(row))(filterDomains))

  const emails = map(
    (result: any) =>
      map(
        (email: IEmail) => ({
          ...pick([
            'value',
            'type',
            'confidence',
            'first_name',
            'last_name',
            'position',
            'seniority',
            'department',
            'linkedin',
            'twitter',
            'phone_number',
          ])(email),
          domain: result.data?.domain,
        }),
        result?.data?.emails
      ),
    results
  ) as IHunterDomainsResult[][]

  return flatten(emails)
}

interface IHunterFinderArgsFromStep {
  firstName: string
  lastName?: string | null
  company?: string | null
  domain?: string | null
}

interface IHunterFinderArgs extends IRow {
  first_name: string
  last_name: string
  company: string
  domain: string
}

interface IHunterFinderResult
  extends Omit<IEmail, 'value' | 'type' | 'confidence' | 'department' | 'seniority'> {
  email: string
}

const getEmailsForFinder = async (table: IHunterFinderArgs[]) => {
  const results = await Promise.all(map((row) => throttledEmailFinder(row))(table))
  const emails = map(({ data }: any) => {
    return {
      ...pick(['email', 'first_name', 'last_name', 'position', 'domain', 'twitter'])(data),
      linkedin: data?.linkedin_url,
      ...pick(['phone_number', 'company'])(data),
    }
  })(results) as IHunterFinderResult[]

  return emails
}

interface IHunterVerifierArgs extends IRow {
  email: string
}

interface IHunterVerifierResult extends IRow {
  status: string
  email: string
  score: string
}

const verifyEmails = async ({ table }: { table: ITable }) => {
  // Just in case the input is not clean
  logger.info(HUNTER_TOKEN)
  const emailToVerifyParametersArray: IHunterVerifierArgs[] = flow(
    map((row: IRow) => mapKeys((key: string) => flow(toLower, replace(' ', ''))(key), row)),
    map((row: IRow) => ({
      email: row.email || '',
    }))
  )(table) as IHunterVerifierArgs[]
  const results = await Promise.all(
    map((row) => throttledEmailVerifier(row))(emailToVerifyParametersArray)
  )
  const emails = map(({ data, errors }: any) => {
    if (errors) {
      map((err: any) => {
        logger.error(err?.details)
      })(errors)
    }
    return {
      email: data?.email ?? '',
      status: data?.status ?? '',
      score: data?.score?.toString() ?? '',
    }
  })(results) as IHunterVerifierResult[]
  return emails
}

export { getEmailsForDomains, getEmailsForFinder, verifyEmails }

export type {
  IHunterDomainsArgs,
  IHunterDomainsResult,
  IHunterFinderArgs,
  IHunterFinderArgsFromStep,
  IHunterFinderResult,
  IHunterVerifierArgs,
  IHunterVerifierResult,
}
