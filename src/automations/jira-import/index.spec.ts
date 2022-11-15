import { expect } from 'chai'
import status from 'http-status'
import type JiraApi from 'jira-client'
import { pick } from 'lodash'
import { flatMap, omit } from 'lodash/fp'
import sinon from 'sinon'

import * as Jira from '../../config/jira'
import { STEP_RUN_STATUSES } from '../../constants'
import { PROJECT_LANGUAGE_COUNTRY_MAP } from './delete-me'
import jiraImportHandler from './index'
import { IIssue } from './types'

const JIRA_URL = 'https://myorg.atlassian.net'
const TOKEN = '07efd48c-a87b-4f14-b4ab-c49b17d040eb'
const PROJECTS = ['SA', 'CZE', 'PM'] as const

const FIELDS = [
  'summary',
  'description',
  'attachment',
  'priority',
  'status',
  'customfield_10037',
  'customfield_10038',
  'assignee',
] as const

type TFieldKey = typeof FIELDS[number]
type TProjectKey = typeof PROJECTS[number]

const JIRA_ISSUES: Record<TProjectKey, IIssue<TFieldKey>[]> = {
  SA: [
    {
      key: 'SA-1',
      fields: {
        summary: 'Test ticket',
        description: 'Test ticket description',
        attachment: 'https://download.com/menu.jpg',
        assignee: { displayName: 'Invisible' },
        status: { name: 'To Do' },
        customfield_10037: 'South Africa',
        customfield_10038: 'Cape Town',
        priority: { name: 'Urgent' },
      },
    },
    {
      key: 'SA-2',
      fields: {
        summary: 'Test ticket',
        attachment: 'https://download.com/abc.jpg',
        assignee: { displayName: 'Invisible' },
        description: 'Test ticket description',
        status: { name: 'To Do' },
        customfield_10037: 'South Africa',
        customfield_10038: 'Johannesburg',
        priority: { name: 'Normal' },
      },
    },
  ],
  PM: [],
  CZE: [
    {
      key: 'CZE-2',
      fields: {
        summary: 'Test ticket',
        attachment: 'https://download.com/abc.jpg',
        assignee: { displayName: 'Invisible' },
        description: 'Test ticket description',
        status: { name: 'To Do' },
        customfield_10037: 'Czech Republic',
        customfield_10038: 'Prague',
        priority: { name: 'Urgent' },
      },
    },
  ],
}

let stubJiraApi: sinon.SinonStub
describe.skip('jira-import', () => {
  before(() => {
    stubJiraApi = sinon.stub(Jira, 'init').returns(
      Promise.resolve({
        host: 'inv-test.atlassian.net',
        searchJira: async (jql: string, options: JiraApi.SearchQuery) => {
          const proj = jql.split('project = ')[1] as TProjectKey
          if (!PROJECTS.includes(proj)) return { errorMessage: `${proj} does not exist` }
          expect(jql).to.contain('project = ')
          expect(options.maxResults).to.equal(1000)
          expect(options.fields).to.deep.equal([
            'summary',
            'description',
            'attachment',
            'priority',
            'status',
            'customfield_10037',
            'customfield_10038',
            'assignee',
          ])

          return {
            issues: JIRA_ISSUES[proj],
          }
        },
      } as any)
    )
  })
  after(() => {
    stubJiraApi.restore()
  })
  beforeEach(() => {
    process.env.JIRA_USERNAME = 'username'
    process.env.JIRA_PASSWORD = 'password'
  })
  afterEach(() => {
    delete process.env.JIRA_USERNAME
    delete process.env.JIRA_PASSWORD
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

  it('should return a promise with JIRA tickets', async () => {
    const { stubResponse } = setup()
    const stepRunId = 123
    const jiraUrl = JIRA_URL
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        projects: PROJECTS,
        fields: FIELDS,
      },
    }

    await jiraImportHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubJiraApi.calledOnce).to.equal(true)
    expect(stubJiraApi.firstCall.args[0]).to.equal('https://myorg.atlassian.net')

    const jiraTickets = flatMap((o) => o, JIRA_ISSUES).map((issue) => ({
      id: issue.key,
      ...pick(issue.fields, FIELDS),
      assignee: issue.fields.assignee?.displayName,
      priority: issue.fields.priority?.name,
      status: issue.fields.status?.name,
      url: 'https://inv-test.atlassian.net/browse/' + issue.key,
      language:
        PROJECT_LANGUAGE_COUNTRY_MAP[
          issue.key.split('-')[0] as keyof typeof PROJECT_LANGUAGE_COUNTRY_MAP
        ].language,
      customfield_10037:
        PROJECT_LANGUAGE_COUNTRY_MAP[
          issue.key.split('-')[0] as keyof typeof PROJECT_LANGUAGE_COUNTRY_MAP
        ].country,
    }))
    expect(stubResponse.send.calledOnce).to.equal(true)
    expect(stubResponse.send.firstCall.args).to.deep.equal([
      {
        stepRunId,
        token: TOKEN,
        data: {
          jiraTickets,
        },
        status: STEP_RUN_STATUSES.DONE,
      },
    ])
  })

  it('should throw an error when invalid project searched', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const jiraUrl = JIRA_URL
    const projects = [...PROJECTS, 'FAKE']
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        projects,
        fields: FIELDS,
      },
    }

    await jiraImportHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.INTERNAL_SERVER_ERROR])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'Error fetching JIRA tickets. Message: FAKE does not exist',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if no jiraUrl passed in', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const jiraUrl = undefined
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        projects: PROJECTS,
        fields: FIELDS,
      },
    }

    await jiraImportHandler({ body: reqBody } as any, stubResponse as any)

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

  it('should throw a 400 error if no projects passed in', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const jiraUrl = 'https://inv.atlassian.net'
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        projects: undefined,
        fields: FIELDS,
      },
    }

    await jiraImportHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'projects is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if no fields passed in', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const jiraUrl = 'https://inv.atlassian.net'
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        projects: PROJECTS,
        fields: undefined,
      },
    }

    await jiraImportHandler({ body: reqBody } as any, stubResponse as any)

    expect(stubResponse.status.calledOnce).to.equal(true)
    expect(stubResponse.status.firstCall.args).to.deep.equal([status.BAD_REQUEST])

    expect(errorSend.calledOnce).to.equal(true)
    expect(omit(['stack'], errorSend.firstCall.args[0])).to.deep.equal({
      stepRunId,
      token: TOKEN,
      errorCode: status.BAD_REQUEST,
      errorMessage: 'fields is a required field',
      status: STEP_RUN_STATUSES.FAILED,
    })
  })

  it('should throw a 400 error if jiraUrl does not match schema', async () => {
    const { stubResponse, errorSend } = setup()
    const stepRunId = 123
    const jiraUrl = 'https://inv.atlassians.net'
    const reqBody = {
      stepRunId,
      token: TOKEN,
      data: {
        jiraUrl,
        projects: PROJECTS,
        fields: FIELDS,
      },
    }

    await jiraImportHandler({ body: reqBody } as any, stubResponse as any)

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
})
