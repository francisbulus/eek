import { Business, day_of_week_names } from 'prisma-seated'

import { TSeatedPayload } from './seated'

const PLATFORMS = {
  OPENTABLE: 'opentable',
  RESY: 'resy',
  SEVENROOMS: 'sevenrooms',
  YELP: 'yelp',
} as const

type TPlatform = typeof PLATFORMS[keyof typeof PLATFORMS]

type TCity = 'atlanta' | 'boston' | 'chicago' | 'dallas' | 'new_york_city' | 'philadelphia'

/**
 * All these are in the business's time zone
 */
interface ISlotTimeRange {
  slots_date: string
  slots_start_time: string
  slots_end_time: string
}

type TSlotTimesOrRanges = {
  slotTimeOverrides?: Date[]
  slotTimeRanges: ISlotTimeRange[]
}

interface IValidBusiness extends Business {
  url_id: string
  url: string
  timezone: string
}

const isValidBusiness = (b: Business): b is IValidBusiness =>
  Boolean(b.url_id && b.url && b.timezone)

interface IValidOpentableBusiness extends IValidBusiness {
  platform: typeof PLATFORMS.OPENTABLE
}

interface IValidResyBusiness extends IValidBusiness {
  platform: typeof PLATFORMS.RESY
}

interface IValidSevenroomsBusiness extends IValidBusiness {
  platform: typeof PLATFORMS.SEVENROOMS
}

interface IValidYelpBusiness extends IValidBusiness {
  platform: typeof PLATFORMS.YELP
  latitude: number
  longitude: number
}

const isValidOpentableBusiness = (b: IValidBusiness): b is IValidOpentableBusiness =>
  Boolean(b.platform === PLATFORMS.OPENTABLE)

const isValidResyBusiness = (b: IValidBusiness): b is IValidResyBusiness =>
  Boolean(b.platform === PLATFORMS.RESY)

const isValidSevenroomsBusiness = (b: IValidBusiness): b is IValidSevenroomsBusiness =>
  Boolean(b.platform === PLATFORMS.SEVENROOMS)

const isValidYelpBusiness = (b: IValidBusiness): b is IValidYelpBusiness =>
  b.platform === PLATFORMS.YELP && Boolean(b.latitude) && Boolean(b.longitude)

interface IValidBusinessMap {
  [PLATFORMS.OPENTABLE]: IValidOpentableBusiness
  [PLATFORMS.RESY]: IValidResyBusiness
  [PLATFORMS.SEVENROOMS]: IValidSevenroomsBusiness
  [PLATFORMS.YELP]: IValidYelpBusiness
}

type TValidBusiness<T extends TPlatform> = IValidBusinessMap[T]

type TGetAvailabilityAndParseArgs = {
  batch_id: number
  external_id: number
  party_size: number
  humanReadableDate?: boolean
  useProxy?: boolean
  check_dow: day_of_week_names
  check_time: string
  sendToSeated?: boolean
  test_mode?: boolean
  force?: boolean
  cohort_external_id: number
  cohort_id: number
  addDays?: number
} & TSlotTimesOrRanges

type TGetAvailabilityAndParseFn = (
  args: TGetAvailabilityAndParseArgs
) => Promise<TSeatedPayload | undefined>

type TScrapeAndParseArgs<T extends IValidBusiness> = {
  business: T
  party_size: number
  slotTimeRanges: ISlotTimeRange[]
  slotTimeOverrides?: Date[]
  useProxy: boolean
  humanReadableDate?: boolean
}

type TPayloadWithRetryCount = {
  payload: TSeatedPayload
  numRequests: number
  retryCount: number
}

type TScrapeAndParseFn<T extends IValidBusiness> = (
  args: TScrapeAndParseArgs<T>
) => Promise<TPayloadWithRetryCount>

export type {
  ISlotTimeRange,
  IValidBusiness,
  IValidBusinessMap,
  IValidOpentableBusiness,
  IValidResyBusiness,
  IValidSevenroomsBusiness,
  IValidYelpBusiness,
  TCity,
  TGetAvailabilityAndParseArgs,
  TGetAvailabilityAndParseFn,
  TPayloadWithRetryCount,
  TPlatform,
  TScrapeAndParseArgs,
  TScrapeAndParseFn,
  TSlotTimesOrRanges,
  TValidBusiness,
}

export {
  isValidBusiness,
  isValidOpentableBusiness,
  isValidResyBusiness,
  isValidSevenroomsBusiness,
  isValidYelpBusiness,
  PLATFORMS,
}
