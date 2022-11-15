import { expect } from 'chai'
import status from 'http-status'
import { omit } from 'lodash/fp'
import sinon from 'sinon'

import { STEP_RUN_STATUSES } from '../../../constants'
import addNumbersHandler from './index'

describe('add-numbers', () => {
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

  it('should add two numbers', async () => {
    const { stubResponse } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
    const num1 = 123
    const num2 = 456
    const reqBody = {
      stepRunId,
      token,
      data: {
        num1,
        num2,
      },
    }

    await addNumbersHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        stepRunId,
        token,
        data: {
          num3: 579,
        },
        status: STEP_RUN_STATUSES.DONE,
      },
    ])
  })

  it('should throw a 400 error if input is missing', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
    const num1 = 123
    const num2 = undefined
    const reqBody = {
      stepRunId,
      token,
      data: {
        num1,
        num2,
      },
    }

    await addNumbersHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'num2 is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })
})
