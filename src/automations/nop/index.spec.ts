import { expect } from 'chai'
import sinon from 'sinon'

import { STEP_RUN_STATUSES } from '../../constants'
import noOp from './index'

describe('nop', () => {
  const setup = () => {
    const errorSend = sinon.stub()
    const stubResponse = {
      send: sinon.stub(),
      status: sinon.stub().returns({
        send: errorSend,
      }),
    }

    return { stubResponse, errorSend }
  }

  it('should return empty object', async () => {
    const { stubResponse } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
    const reqBody = {
      stepRunId,
      token,
      data: {
        fake: '123',
      },
    }

    await noOp({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.DONE,
      },
    ])
  })
})
