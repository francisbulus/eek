import * as env from 'env-var'

export const NODE_ENV = env.get('NODE_ENV').asString()

export const PORT = env.get('PORT').required().asInt()

export const SEATED_DATABASE_URL = env.get('SEATED_DATABASE_URL').required().asString()
export const SEATED_API_URL = env.get('SEATED_API_URL').required().asString()
export const SEATED_API_KEY = env.get('SEATED_API_KEY').required().asString()

export const PRISMA_BINARY_TARGET = env.get('PRISMA_BINARY_TARGET').default('["native"]').asArray()

export const BRIGHTDATA_USERNAME = env.get('BRIGHTDATA_USERNAME').required().asString()
export const BRIGHTDATA_PASSWORD = env.get('BRIGHTDATA_PASSWORD').required().asString()
export const GEOSURF_USERNAME = env.get('GEOSURF_USERNAME').required().asString()
export const GEOSURF_PASSWORD = env.get('GEOSURF_PASSWORD').required().asString()
export const SOAX_USERNAME = env.get('SOAX_USERNAME').required().asString()
export const SOAX_PASSWORD = env.get('SOAX_PASSWORD').required().asString()

export const INV_PROXY_USERNAME = env.get('INV_PROXY_USERNAME').required().asString()
export const INV_PROXY_PASSWORD = env.get('INV_PROXY_PASSWORD').required().asString()

export const PRISMA_LOGGING = env.get('PRISMA_LOGGING').default('false').asBool()

export const REDIS_URL = env.get('REDIS_URL').required().asString()
export const AUTOMATIONS_URL = env.get('AUTOMATIONS_URL').required().asString()
export const AUTOMATIONS_TOKEN = env.get('AUTOMATIONS_TOKEN').required().asString()

export const BUSINESS_PER_FUNCTION = env.get('BUSINESS_PER_FUNCTION').default(2).asIntPositive()
