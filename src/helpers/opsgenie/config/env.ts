import env from 'env-var'

export const OPSGENIE_API_KEY = env.get('OPSGENIE_API_KEY').required().asString()
