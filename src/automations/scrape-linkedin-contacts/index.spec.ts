import { expect } from 'chai'
import status from 'http-status'
import { omit } from 'lodash/fp'
import sinon from 'sinon'

import { STEP_RUN_STATUSES } from '../../constants'
import scrapeHandler from './index'

describe('start scraping', () => {
  const setup = () => {
    const errorSend = sinon.stub()
    const stubResponse = {
      send: sinon.stub(),
      status: sinon.stub().returns({
        send: errorSend,
      }),
    }
    const bragiUp = {
      createJob: sinon.stub().resolves(200),
    }
    const bragiDown = {
      createJob: sinon.stub().rejects(),
    }

    return { stubResponse, errorSend, bragiUp, bragiDown }
  }

  it('should return a scraping job', async () => {
    const { stubResponse, bragiUp } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
    const reqBody = {
      stepRunId,
      token,
      data: {
        credentialsId: 1,
        urls: ['tests'],
      },
    }

    await scrapeHandler({ body: reqBody } as any, stubResponse as any, bragiUp)

    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.RUNNING,
      },
    ])
  })

  it('should throw a 400 error if no input passed in', async () => {
    const { stubResponse, errorSend, bragiUp } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'

    const reqBody = {
      stepRunId,
      token,
      data: {
        credentialsId: undefined,
        urls: undefined,
      },
    }

    await scrapeHandler({ body: reqBody } as any, stubResponse as any, bragiUp)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'urls is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should return a failure status if bragi is down', async () => {
    const { stubResponse, bragiDown } = setup()
    const stepRunId = 123
    const token = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'

    const reqBody = {
      stepRunId,
      token,
      data: {
        credentialsId: 1,
        urls: ['tests'],
      },
    }

    await scrapeHandler({ body: reqBody } as any, stubResponse as any, bragiDown)

    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        errorMessage: '{}',
        stepRunId,
        token,
        data: {},
        status: STEP_RUN_STATUSES.FAILED,
      },
    ])
  })
})
