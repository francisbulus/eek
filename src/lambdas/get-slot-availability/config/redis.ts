import IORedis from 'ioredis'

import { REDIS_URL } from './env'

const seatedRedis = new IORedis(REDIS_URL, { keyPrefix: 'seated:' })

export { seatedRedis }
