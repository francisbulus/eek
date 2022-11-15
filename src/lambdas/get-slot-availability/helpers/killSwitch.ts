import { toLower } from 'lodash/fp'

import { seatedRedis } from '../config/redis'

const SEATED_KILL_SWITCH_KEY = 'killswitch'

const getKillSwitch = async () => {
  const ret = await seatedRedis.get(SEATED_KILL_SWITCH_KEY)
  return Boolean(ret && toLower(ret) === 'true')
}

const setKillSwitch = async (v: boolean) => seatedRedis.set(SEATED_KILL_SWITCH_KEY, `${v}`)

export { getKillSwitch, setKillSwitch }
