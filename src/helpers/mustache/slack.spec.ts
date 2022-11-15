import { expect } from 'chai'
import { oneLineTrim } from 'common-tags'
import sinon from 'sinon'
import timekeeper from 'timekeeper'

import { mockedStepRun } from '../../../test/fixtures/stepRun'
import { slackBotStub } from '../../../test/stubs/slack'
import { MIDGARD_URL } from '../../config/env'
import { StepRun } from '../../external/mimir/StepRun'
import { moment, TZ } from '../../helpers/moment'
import { preRenderSlackMessageVars } from './slack'

const sandbox = sinon.createSandbox()

describe('slack preRenderSlackMessageVars', () => {
  beforeEach(() => {
    sandbox.stub(StepRun, 'findById').resolves(mockedStepRun)
  })

  afterEach(() => {
    sandbox.restore()
    timekeeper.reset()
  })

  it('should return the correct vars', async () => {
    timekeeper.freeze(moment.tz('2021-02-14 13:37:49', TZ).toDate())

    const templateString = oneLineTrim`
      {{ assignee.email }} |
      {{ assignee.id }} |
      {{ assignee.name }} |
      {{ assignee.slackMention }} |
      {{ assignee.slackUsername }} |
      {{ client.email }} |
      {{ client.id }} |
      {{ client.name }} |
      {{ company.id }} |
      {{ company.name }} |
      {{ currentDate }} |
      {{ delegation.deadline }} |
      {{ delegation.id }} |
      {{ delegation.name }} |
      {{ delegation.quoteAmount }} |
      {{ delegation.slackLink }} |
      {{ owner.email }} |
      {{ owner.id }} |
      {{ owner.name }} |
      {{ owner.slackMention }} |
      {{ owner.slackUsername }} |
      {{ process.id }} |
      {{ process.name }} |
      {{ qaAssignee.email }} |
      {{ qaAssignee.id }} |
      {{ qaAssignee.name }} |
      {{ qaAssignee.slackMention }} |
      {{ qaAssignee.slackUsername }} |
      {{ qaMessage }}
    `

    const actual = await preRenderSlackMessageVars({
      stepRunId: 11111,
      templateString,
      bot: slackBotStub,
    })

    const expected = {
      assignee: {
        id: '678910',
        email: 'gabriela.benitez@mail.com',
        name: 'myAssignee',
        slackMention: '<@UHEJPGLV8>',
        slackUsername: 'gabriela.benitez',
      },
      client: { id: '55555', email: 'client@mail.com', name: 'myClient' },
      company: { id: '44444', name: 'myCompany' },
      delegation: {
        id: '22222',
        deadline: 'September 10th 2021, 01:37PM PDT',
        name: 'myInstance',
        quoteAmount: '$1,234.50',
        slackLink: '<http://localhost:3004/instance/22222|myInstance>',
      },
      owner: {
        id: '66666',
        email: 'rene@mail.com',
        name: 'myOwner',
        slackMention: '<@UHCRE7JHG>',
        slackUsername: 'rene.arias',
      },
      process: { id: '88888', name: 'myProcess' },
      qaAssignee: {
        id: '12345',
        email: 'matteo@mail.com',
        name: 'myQaAssignee',
        slackMention: '<@UHFTR4G58>',
        slackUsername: 'matteo.ghironi',
      },
      currentDate: 'February 14th 2021, 01:37PM PST',
      qaMessage: `This delegation is ready for QA: <${MIDGARD_URL}/instance/22222|myInstance> <@UHFTR4G58>`,
    }

    expect(actual).to.deep.eq(expected)
  })
})
