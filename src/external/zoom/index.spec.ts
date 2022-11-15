import { expect } from 'chai'
import sinon from 'sinon'
import superagent, { SuperAgentRequest } from 'superagent'

import { setMeetingPassword } from './index'

const sandbox = sinon.createSandbox()

const mockRequest = ({
  set: () => ({ set: () => ({ send: () => ({ then: () => 'test' }) }) }),
} as any) as SuperAgentRequest

describe('zoom', () => {
  beforeEach(() => {
    sandbox.stub(superagent, 'patch').resolves().returns(mockRequest)
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('setMeetingPassword', () => {
    it('should call zoom api', async () => {
      const response = await setMeetingPassword({ meetingId: '123456', password: '1e78e9620782' })
      expect(response).to.eq('test')
    })
  })
})
