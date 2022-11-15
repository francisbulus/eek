import { expect } from 'chai'
import sinon from 'sinon'
import timekeeper from 'timekeeper'

import { mockedStepRun } from '../../../test/fixtures/stepRun'
import { slackBotStub } from '../../../test/stubs/slack'
import { MIDGARD_URL } from '../../config/env'
import { moment, TZ } from '../../helpers/moment'
import { StepRun } from '../mimir/StepRun'
import {
  assigneeEmail,
  assigneeId,
  assigneeName,
  assigneeSlackUserMention,
  assigneeSlackUsername,
  clientEmail,
  clientId,
  clientName,
  companyId,
  companyName,
  currentDate,
  instanceDeadline,
  instanceId,
  instanceLink,
  instanceName,
  instanceQuoteAmount,
  ownerEmail,
  ownerId,
  ownerName,
  ownerSlackUserMention,
  ownerSlackUsername,
  processId,
  processName,
  qaAssigneeEmail,
  qaAssigneeId,
  qaAssigneeName,
  qaMessage,
  qaSlackUserMention,
  qaSlackUsername,
} from './dal'

const sandbox = sinon.createSandbox()

describe('dal mustache tags for slack', () => {
  beforeEach(() => {
    sandbox.stub(StepRun, 'findById').resolves(mockedStepRun)
  })

  afterEach(() => {
    sandbox.restore()
    timekeeper.reset()
  })

  it('instanceName should return instanceName', async () => {
    const actual = await instanceName(11111)
    expect(actual).to.eq('myInstance')
  })

  it('instanceId should return instanceId', async () => {
    const actual = await instanceId(11111)
    expect(actual).to.eq('22222')
  })

  it('instanceLink should return instanceLink', async () => {
    const actual = await instanceLink(11111)
    const url = `${MIDGARD_URL}/instance/22222`
    const link = `<${url}|myInstance>`
    expect(actual).to.eq(link)
  })

  it('instanceDeadline should return instanceDeadline', async () => {
    const actual = await instanceDeadline(11111)
    expect(actual).to.eq('September 10th 2021, 01:37PM PDT')
  })

  it('instanceQuoteAmount should return instanceQuoteAmount', async () => {
    const actual = await instanceQuoteAmount(11111)
    expect(actual).to.eq('$1,234.50')
  })

  it('assigneeName should return assigneeName', async () => {
    const actual = await assigneeName(11111)
    expect(actual).to.eq('myAssignee')
  })

  it('assigneeId should return assigneeId', async () => {
    const actual = await assigneeId(11111)
    expect(actual).to.eq('678910')
  })

  it('assigneeEmail should return assigneeEmail', async () => {
    const actual = await assigneeEmail(11111)
    expect(actual).to.eq('gabriela.benitez@mail.com')
  })

  it('assigneeSlackUsername should return assigneeSlackUsername', async () => {
    const actual = await assigneeSlackUsername(11111, slackBotStub)
    expect(actual).to.eq('gabriela.benitez')
  })

  it('assigneeSlackUserMention should return assigneeSlackUserMention', async () => {
    const actual = await assigneeSlackUserMention(11111, slackBotStub)
    expect(actual).to.eq('<@UHEJPGLV8>')
  })

  it('qaAssigneeName should return qaAssigneeName', async () => {
    const actual = await qaAssigneeName(11111)
    expect(actual).to.eq('myQaAssignee')
  })

  it('qaAssigneeId should return qaAssigneeId', async () => {
    const actual = await qaAssigneeId(11111)
    expect(actual).to.eq('12345')
  })

  it('qaAssigneeEmail should return qaAssigneeEmail', async () => {
    const actual = await qaAssigneeEmail(11111)
    expect(actual).to.eq('matteo@mail.com')
  })

  it('qaSlackUsername should return qaSlackUsername', async () => {
    const actual = await qaSlackUsername(11111, slackBotStub)
    expect(actual).to.eq('matteo.ghironi')
  })

  it('qaSlackUserMention should return qaSlackUserMention', async () => {
    const actual = await qaSlackUserMention(11111, slackBotStub)
    expect(actual).to.eq('<@UHFTR4G58>')
  })

  it('companyName should return companyName', async () => {
    const actual = await companyName(11111)
    expect(actual).to.eq('myCompany')
  })

  it('companyId should return companyId', async () => {
    const actual = await companyId(11111)
    expect(actual).to.eq('44444')
  })

  it('ownerName should return ownerName', async () => {
    const actual = await ownerName(11111)
    expect(actual).to.eq('myOwner')
  })

  it('ownerId should return ownerId', async () => {
    const actual = await ownerId(11111)
    expect(actual).to.eq('66666')
  })

  it('ownerEmail should return ownerEmail', async () => {
    const actual = await ownerEmail(11111)
    expect(actual).to.eq('rene@mail.com')
  })

  it('ownerSlackUsername should return ownerSlackUsername', async () => {
    const actual = await ownerSlackUsername(11111, slackBotStub)
    expect(actual).to.eq('rene.arias')
  })

  it('ownerSlackUserMention should return ownerSlackUserMention', async () => {
    const actual = await ownerSlackUserMention(11111, slackBotStub)
    expect(actual).to.eq('<@UHCRE7JHG>')
  })

  it('clientName should return clientName', async () => {
    const actual = await clientName(11111)
    expect(actual).to.eq('myClient')
  })

  it('clientId should return clientId', async () => {
    const actual = await clientId(11111)
    expect(actual).to.eq('55555')
  })

  it('clientEmail should return clientEmail', async () => {
    const actual = await clientEmail(11111)
    expect(actual).to.eq('client@mail.com')
  })

  it('processName should return processName', async () => {
    const actual = await processName(11111)
    expect(actual).to.eq('myProcess')
  })

  it('processId should return processId', async () => {
    const actual = await processId(11111)
    expect(actual).to.eq('88888')
  })

  it('currentDate should return currentDate', async () => {
    timekeeper.freeze(moment.tz('2021-02-14 13:37:49', TZ).toDate())

    const actual = await currentDate()
    const expected = 'February 14th 2021, 01:37PM PST'

    expect(actual).to.eq(expected)
  })

  it('qaMessage should return qaMessage', async () => {
    const actual = await qaMessage(11111, slackBotStub)

    const slackUserMention = await qaSlackUserMention(11111, slackBotStub)
    const url = `${MIDGARD_URL}/instance/22222`
    const link = `<${url}|myInstance>`
    const message = `This delegation is ready for QA: ${link} ${slackUserMention}`
    expect(actual).to.eq(message)
  })
})
