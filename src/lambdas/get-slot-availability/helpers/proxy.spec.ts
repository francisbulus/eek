import { expect } from 'chai'
import { get } from 'lodash/fp'

import { INV_PROXY_PASSWORD, INV_PROXY_USERNAME } from '../config/env'
import type { TSuperagentWithProxy } from './proxy'
import {
  brightdataUrl,
  geosurfUrl,
  normalizeWeights,
  proxiedSuperagent,
  randomProxyUrl,
  superagent,
} from './proxy'

describe('proxy helpers', () => {
  describe('normalizeWeights', () => {
    it('should normalize the weights', async () => {
      const weights = [
        { weight: 1, val: 'a' },
        { weight: 2, val: 'b' },
        { weight: 3, val: 'c' },
      ]

      const actual = normalizeWeights(weights)
      const expected = [
        { weight: 0.16666666666666666, val: 'a' },
        { weight: 0.3333333333333333, val: 'b' },
        { weight: 0.5, val: 'c' },
      ]
      expect(actual).to.deep.eq(expected)
    })
  })

  describe('geosurfUrl', () => {
    it('should generate the geosurf URL', async () => {
      const actual = geosurfUrl()
      const expected = `http://${INV_PROXY_USERNAME}:${INV_PROXY_PASSWORD}@proxy.inv.tech:24001`
      expect(actual).to.eq(expected)
    })
  })

  describe('brightdataUrl', () => {
    it('should generate the brightdata URL', async () => {
      const actual = brightdataUrl()
      const expected = `http://${INV_PROXY_USERNAME}:${INV_PROXY_PASSWORD}@proxy.inv.tech:24000`
      expect(actual).to.eq(expected)
    })
  })

  describe('proxiedSuperagent', () => {
    it.skip('should make a proxied request', async () => {
      // Note, this will actually make a network call, so don't remove .skip unless you are testing locally

      const sessionId = undefined
      const url = 'http://lumtest.com/myip.json'

      const { proxyUrl } = randomProxyUrl({ sessionId })

      const sup = proxiedSuperagent({
        sup: superagent.get(url).type('json').accept('json') as TSuperagentWithProxy,
        proxyUrl,
      })
      const resp1 = await sup.then(get('body'))
      console.log(resp1) // eslint-disable-line no-console
      const { ip } = resp1

      const sup2 = proxiedSuperagent({
        sup: superagent.get(url).type('json').accept('json') as TSuperagentWithProxy,
        proxyUrl,
      })
      const resp2 = await sup2.then(get('body'))
      console.log(resp2) // eslint-disable-line no-console
      const { ip: ip2 } = resp1

      expect(ip).to.eq(ip2)
    })
  })
})
