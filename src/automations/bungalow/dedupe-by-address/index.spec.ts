import { AxiosResponse } from 'axios'
import { expect } from 'chai'
import sinon from 'sinon'

import { ultron } from '../../../external/ultron'
import { BaseRun } from '../../../helpers/types'
import * as bungalowHelpers from '../helpers'
import { addAddressGroupKey, buildBaseRunGroupsByAddress, getAggregatedAddresses } from './index'

const sandbox = sinon.createSandbox()

describe('dedupe leads by address', () => {
  beforeEach(() => {
    const response = {
      data: [],
      status: 200,
    } as AxiosResponse

    sandbox.stub(ultron.stepRun, 'findById').resolves({} as any)
    sandbox.stub(ultron.baseRun, 'findById').resolves({} as any)
    sandbox.stub(ultron.baseRun, 'findMany').resolves([] as any)
    sandbox.stub(bungalowHelpers, 'markAllDuplicatesInGroups').resolves(response as any)
  })
  afterEach(() => {
    sandbox.restore()
  })

  const setup = () => {
    const currentBatchLeads = ([
      {
        id: 'feaf0b55-1c89-4b6b-b353-49feb3859fbc',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: 'a5143f2e-f8a0-46ea-8368-c7a462d0f0f6',
            value: '300 Boylston Avenue E, Seattle, WA 98102',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '15ed0395-a14b-4b98-a5ed-21be2e956567',
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
            id: '8899bb4a-aca4-49ee-9dbe-bd339d261006',
            value: '300 Boylston Ave E, Seattle, WA 98102',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '5fd4f847-3971-42e7-90c9-97c11e79b775',
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
            id: 'a4a4e5de-664f-4e87-ab2b-02b9bce60509',
            value: '600 West Red Ave, West Red, NJ 08079',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: 'dd328247-b4d1-44e7-8be5-8c2bfb059468',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: '0a982225-fa6a-4bb6-bacd-a40b29f8fe70',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '494929fa-fceb-489e-9bd5-022f9e803865',
            value: '"17430 Denby, Redford, Michigan, 48240"',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '778f51fe-e863-4965-96ba-3ceb73a71db8',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
      {
        id: 'd0b3b524-5027-4846-ba68-500ded6ded21',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '014a34a4-a056-4dc8-bda3-04eddebb9fa6',
            value: '"17430 Denby, Redford, Michigan, 48240"',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '4705595d-a6e1-4a27-a930-30c11ab8298d',
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
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
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
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
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
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: 'ef783645-bee0-4a96-9631-e629ff24b17c',
            value: '123',
            baseVariableId: '381618a2-24c6-4229-8511-735829307ba9',
          },
        ],
      },
    ] as unknown) as BaseRun[]
    return { currentBatchLeads }
  }

  describe('getAggregatedAddresses', () => {
    it('should get aggregated addresses', async () => {
      const { currentBatchLeads } = setup()
      const result = getAggregatedAddresses(currentBatchLeads)
      expect(result).to.deep.equal([
        '300-Boylston-Ave-E,-Seattle,-WA-98102',
        '600-West-Red-Ave,-West-Red,-NJ-08079',
        '17430-denby-redford-michigan-48240',
      ])
    })
  })

  describe('addAddressGroupKey', () => {
    it('should add the normalized address as group key', async () => {
      const { currentBatchLeads } = setup()
      const actual = addAddressGroupKey(currentBatchLeads[0])
      expect(actual).to.deep.equal({
        baseRun: currentBatchLeads[0],
        groupKey: '300-Boylston-Ave-E,-Seattle,-WA-98102',
      })
    })
  })

  describe('buildBaseRunGroupsByAddress', () => {
    it('should build the groups, based on normalized address', async () => {
      const { currentBatchLeads } = setup()
      const actual = buildBaseRunGroupsByAddress(currentBatchLeads)

      // should end up with three groups, the first and third group will have two baseRuns
      expect(actual.length).to.eq(3)
      expect(actual[0].length).to.eq(2)
      expect(actual[1].length).to.eq(1)
      expect(actual[2].length).to.eq(2)
    })
  })
})
