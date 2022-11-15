import { expect } from 'chai'
import sinon from 'sinon'

import { ultron } from '../../../external/ultron'
import { BaseRun } from '../../../helpers/types'
import * as bungalowHelpers from '../helpers'
import {
  addPhoneGroupKey,
  buildBaseRunGroupsByPhone,
  getAggregatedPhoneNumbers,
  isDuplicateByPhone,
} from './index'

const sandbox = sinon.createSandbox()

describe('dedupe leads by phone', () => {
  beforeEach(() => {
    sandbox.stub(ultron.stepRun, 'findById').resolves({} as any)
    sandbox.stub(ultron.baseRun, 'findById').resolves({} as any)
    sandbox.stub(ultron.baseRun, 'findMany').resolves([] as any)
    sandbox.stub(bungalowHelpers, 'markAllDuplicatesInGroups').resolves()
  })
  afterEach(() => {
    sandbox.restore()
  })

  const setup = () => {
    const aggregatedPhoneNumbers = ['+14157047281', '+14167041231']
    const aggregatedPhoneNumbers2 = ['+14157047333', '+14167041231', '+14157047111']
    const currentBatchLeads = ([
      {
        id: 'feaf0b55-1c89-4b6b-b353-49feb3859fbc',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '000b2c20-a200-4287-ba87-c868d16acc8b',
            value: '415-704-7281',
            baseVariableId: '719fb984-388f-434a-b01c-dc49212d2535',
          },
          {
            id: '0364de66-7bc4-44c5-81d8-54577940c4a4',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: '941101ce-4a61-4733-9969-1a943500ae34',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '014a34a4-a056-4dc8-bda3-04eddebb9fa6',
            value: '(416) 704-1231',
            baseVariableId: '719fb984-388f-434a-b01c-dc49212d2535',
          },
          {
            id: '5f371f6f-135f-4b70-bd35-aee31081f3a0',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: 'abcf0b55-1c89-4b6b-b353-49feb3859abc',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '1707dc82-471c-4c6b-9e0c-7ef928cc144b',
            value: '(415) 704-7281',
            baseVariableId: '719fb984-388f-434a-b01c-dc49212d2535',
          },
          {
            id: '9da2768e-8123-490e-95f9-382511d144c6',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: 'dd5ffb71-74e1-4468-8177-1c258daae225',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '59ec24cc-d355-4c5d-aec6-18995baf6fb4',
            value: '', // this will be filtered out
            baseVariableId: '719fb984-388f-434a-b01c-dc49212d2535',
          },
          {
            id: '387f80cb-8973-497f-a529-95d7261c8b24',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: 'd0bc0f0a-1c91-4f53-b3c4-3e815b1cfd79',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '920ad32f-a918-4d6d-a90e-e45d9eeb35ad',
            value: '           ', // this will be filtered out
            baseVariableId: '719fb984-388f-434a-b01c-dc49212d2535',
          },
          {
            id: '244151a9-25ba-4295-9e7d-1698f8c12821',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: '95ee87be-1e8a-4e30-8cf9-04ec8b08aedf',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '59b3045d-feb6-413c-8451-bd09e8fefd82',
            value: null, // this will be filtered out
            baseVariableId: '719fb984-388f-434a-b01c-dc49212d2535',
          },
          {
            id: 'ef783645-bee0-4a96-9631-e629ff24b17c',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
    ] as unknown) as BaseRun[]
    return { currentBatchLeads, aggregatedPhoneNumbers, aggregatedPhoneNumbers2 }
  }

  describe('getAggregatedPhoneNumbers', () => {
    it('should get aggregated phone numbers', async () => {
      const { currentBatchLeads } = setup()
      const result = getAggregatedPhoneNumbers(currentBatchLeads)
      expect(result).to.deep.equal(['+14157047281', '+14167041231'])
    })
  })

  describe('addPhoneGroupKey', () => {
    it('should add the normalized phone number as groupKey', async () => {
      const { currentBatchLeads } = setup()
      const actual = addPhoneGroupKey(currentBatchLeads[0])
      expect(actual).to.deep.equal({
        baseRun: currentBatchLeads[0],
        groupKey: '+14157047281',
      })
    })
  })

  describe('isDuplicateByPhone', () => {
    it('should return true if baseRun has phone number in the aggregated list', async () => {
      const { currentBatchLeads, aggregatedPhoneNumbers, aggregatedPhoneNumbers2 } = setup()

      const actual0 = isDuplicateByPhone(aggregatedPhoneNumbers)(currentBatchLeads[0])
      const actual1 = isDuplicateByPhone(aggregatedPhoneNumbers)(currentBatchLeads[1])
      const actual2 = isDuplicateByPhone(aggregatedPhoneNumbers)(currentBatchLeads[2])

      const actual3 = isDuplicateByPhone(aggregatedPhoneNumbers2)(currentBatchLeads[0])
      const actual4 = isDuplicateByPhone(aggregatedPhoneNumbers2)(currentBatchLeads[1])
      const actual5 = isDuplicateByPhone(aggregatedPhoneNumbers2)(currentBatchLeads[2])

      expect(actual0).to.eq(true)
      expect(actual1).to.eq(true)
      expect(actual2).to.eq(true)

      expect(actual3).to.eq(false)
      expect(actual4).to.eq(true)
      expect(actual5).to.eq(false)
    })
  })

  describe('buildBaseRunGroupsByPhone', () => {
    it('should build the base run groups, grouped by phone number', async () => {
      const { currentBatchLeads } = setup()
      const actual = buildBaseRunGroupsByPhone(currentBatchLeads)

      // should end up with two groups, the first group will have two baseRuns
      // null, empty string, undefined values are omitted
      expect(actual.length).to.eq(2)
      expect(actual[0].length).to.eq(2)
      expect(actual[1].length).to.eq(1)
    })
  })
})
