import type { Business } from 'prisma-seated'

import { ValidationError } from '../../../helpers/errors'
import { prisma } from '../config/prisma'
import { seatedRedisService } from './redis'
import type {
  IValidBusiness,
  IValidOpentableBusiness,
  IValidResyBusiness,
  IValidSevenroomsBusiness,
  IValidYelpBusiness,
  TPlatform,
} from './types'
import {
  isValidBusiness,
  isValidOpentableBusiness,
  isValidResyBusiness,
  isValidSevenroomsBusiness,
  isValidYelpBusiness,
  PLATFORMS,
} from './types'

/**
 * Retrieves a single business from the db and stores it in Redis
 */
const refreshBusiness = async <T extends TPlatform>({
  external_id,
  batch_id,
  platform,
  cohort_external_id,
}: {
  external_id: number
  batch_id: number
  cohort_external_id: number
  platform: T
}): Promise<null | Business> => {
  const business = await prisma.business.findFirst({
    where: { cohort_external_id, platform, external_id, archived_at: null },
    orderBy: { id: 'desc' },
  })

  // Don't need to await here, it can finish asynchronously
  if (business) seatedRedisService.setBusiness({ cohort_external_id, batch_id, business })

  return business
}

const getBusiness = async <T extends TPlatform>({
  cohort_external_id,
  external_id,
  batch_id,
  platform,
}: {
  cohort_external_id: number
  external_id: number
  batch_id: number
  platform: T
}): Promise<
  | IValidBusiness
  | IValidResyBusiness
  | IValidYelpBusiness
  | IValidOpentableBusiness
  | IValidSevenroomsBusiness
> => {
  const business =
    (await seatedRedisService.getBusiness({ cohort_external_id, batch_id, external_id })) ||
    (await refreshBusiness({ cohort_external_id, batch_id, external_id, platform }))

  if (!business)
    throw new Error(
      `Couldn't find business with external_id: ${external_id}, cohort_external_id: ${cohort_external_id}, and platform: ${platform}`
    )

  const wrongPlatformMsg = `Invalid ${platform} business.`

  if (!isValidBusiness(business)) {
    throw new ValidationError(
      `Business ${business.id} is missing one or more properties: url_id, url, timezone`,
      { business }
    )
  }
  if (platform === PLATFORMS.RESY) {
    if (!isValidResyBusiness(business)) {
      throw new ValidationError(wrongPlatformMsg, { business })
    } else {
      return business
    }
  }
  if (platform === PLATFORMS.OPENTABLE) {
    if (!isValidOpentableBusiness(business)) {
      throw new ValidationError(wrongPlatformMsg, { business })
    } else {
      return business
    }
  }

  if (platform === PLATFORMS.YELP) {
    if (!isValidYelpBusiness(business)) {
      throw new ValidationError(wrongPlatformMsg, { business })
    } else {
      return business
    }
  }

  if (platform === PLATFORMS.SEVENROOMS) {
    if (!isValidSevenroomsBusiness(business)) {
      throw new ValidationError(wrongPlatformMsg, { business })
    } else {
      return business
    }
  }

  return business
}

export { getBusiness, refreshBusiness }
