import { expect } from 'chai'
import status from 'http-status'
import { omit } from 'lodash/fp'
import sinon from 'sinon'

import { STEP_RUN_STATUSES } from '../../constants'
import pipeHandler from './index'

describe('pipe', () => {
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

  it('should return what was passed in', async () => {
    const { stubResponse } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
    const pipeInput = 'howdy'
    const reqBody = {
      stepRunId,
      token,
      data: {
        pipeInput,
      },
    }

    await pipeHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        stepRunId,
        token,
        data: {
          pipeOutput: pipeInput,
        },
        status: STEP_RUN_STATUSES.DONE,
      },
    ])
  })

  it('should throw a 400 error if no input passed in', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
    const pipeInput = undefined
    const reqBody = {
      stepRunId,
      token,
      data: {
        pipeInput,
      },
    }

    await pipeHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'pipeInput is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })
})
