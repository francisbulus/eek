import { expect } from 'chai'
import status from 'http-status'
import { omit } from 'lodash/fp'
import sinon from 'sinon'

import * as Jira from '../../config/jira'
import { STEP_RUN_STATUSES } from '../../constants'
import jiraUpdateHandler from './index'

const JIRA_URL = 'https://myorg.atlassian.net'
const TOKEN = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'

let stubJiraApi: sinon.SinonStub
// skipped due to heimdall issues, but tests work when hasRole commented out
describe.skip('jira-write', () => {
  before(() => {
    stubJiraApi = sinon.stub(Jira, 'init').returns(
      Promise.resolve({
        host: 'inv-test.atlassian.net',
        listTransitions: sinon.stub().returns(
          Promise.resolve([
            { id: 1, name: 'To Do' },
            { id: 2, name: 'In Progress' },
            { id: 3, name: 'Done' },
          ])
        ),
        transitionIssue: sinon.stub().returns(Promise.resolve({})),
      } as any)
    )
  })
  after(() => {
    stubJiraApi.restore()
  })

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

  it('should return a promise with changed status', async () => {
    const { stubResponse } = setup()
    const stepRunId = 123
    const jiraUrl = JIRA_URL
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        jiraId: 'SA-1',
        data: { status: 'In Progress' },
      },
    }

    await jiraUpdateHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubJiraApi.calledOnce).to.equal(true)
    expect(stubJiraApi.firstCall.args[0]).to.equal('https://myorg.atlassian.net')

    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        stepRunId,
        token: TOKEN,
        data: {
          data: { status: 'In Progress' },
        },
        status: STEP_RUN_STATUSES.DONE,
      },
    ])
  })

  it('should throw an error when no data provided', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const jiraUrl = JIRA_URL
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        jiraId: 'SA-1',
        data: undefined,
      },
    }

    await jiraUpdateHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'Warn: No data provided',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if no jiraUrl passed in', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl: undefined,
        jiraId: 'SA-1',
      },
    }

    await jiraUpdateHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'jiraUrl is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if no jiraId passed in', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl: JIRA_URL,
      },
    }

    await jiraUpdateHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'jiraId is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if jiraUrl does not match schema', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl: 'https://inv.atlassians.net',
      },
    }

    await jiraUpdateHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'Invalid JIRA URL',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if jiraId does not match schema', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl: JIRA_URL,
        jiraId: 'abc',
      },
    }

    await jiraUpdateHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'Invalid JIRA ID',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })
})
