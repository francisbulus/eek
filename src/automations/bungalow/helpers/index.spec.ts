import { expect } from 'chai'
import { each, map } from 'lodash/fp'

import { BaseRun } from '../../../helpers/types'
import { buildBaseRunGroupsByAddress } from '../dedupe-by-address'
import {
  filterByDupeValue,
  getDuplicatesInGroups,
  getFalseDupeBaseRuns,
  getNullDupeBaseRuns,
} from './index'

describe('bungalow helpers', () => {
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
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
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
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
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
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
          },
        ],
      },
      {
        id: '0a982225-fa6a-4bb6-bacd-a40b29f8fe70',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '494929fa-fceb-489e-9bd5-022f9e803865',
            value: '17430 Denby, Redford, Michigan, 48240',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '778f51fe-e863-4965-96ba-3ceb73a71db8',
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
          },
        ],
      },
      {
        id: 'd0b3b524-5027-4846-ba68-500ded6ded21',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: '014a34a4-a056-4dc8-bda3-04eddebb9fa6',
            value: '17430 Denby, Redford, Michigan, 48240',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '4705595d-a6e1-4a27-a930-30c11ab8298d',
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
          },
        ],
      },
      {
        id: '9aaed432-0544-4f4b-938e-4d582f70259d',
        baseId: 'cb7df8ef-9658-41a6-824e-aa2e3cf313bd',
        baseRunVariables: [
          {
            id: 'ae71f38c-532e-4ac2-9655-10a1b22f5731',
            value: '17430 Denby, Redford, MI, 48240',
            baseVariableId: 'e29a7bb6-7047-4b5b-935c-5fef995b40b9',
          },
          {
            id: '0edc6be1-9603-45bd-84e3-0cedf2bd5e8b',
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
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
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
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
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
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
            value: null,
            baseVariableId: '15c606d6-4d8a-429c-afc1-dc3a2ae7c830',
          },
        ],
      },
    ] as unknown) as BaseRun[]
    return { currentBatchLeads }
  }

  describe('getDuplicatesInGroups', () => {
    it('should return the base runs that need to be updated as duplicates and non-duplicates', async () => {
      const { currentBatchLeads } = setup()
      const groups = buildBaseRunGroupsByAddress(currentBatchLeads)
      const { duplicateBaseRuns, nonDuplicateBaseRuns } = getDuplicatesInGroups(groups)

      const duplicateIds = map('id', duplicateBaseRuns).sort()
      const nonDuplicateIds = map('id', nonDuplicateBaseRuns).sort()

      const expectedDupIds = [
        '9aaed432-0544-4f4b-938e-4d582f70259d',
        'd0b3b524-5027-4846-ba68-500ded6ded21',
        'feaf0b55-1c89-4b6b-b353-49feb3859fbc',
      ]
      const expectedNonDupIds = [
        '0a982225-fa6a-4bb6-bacd-a40b29f8fe70',
        '941101ce-4a61-4733-9969-1a943500ae34',
        'abcf0b55-1c89-4b6b-b353-49feb3859abc',
      ]

      expect(duplicateIds).to.deep.equal(expectedDupIds)
      expect(nonDuplicateIds).to.deep.equal(expectedNonDupIds)
    })

    it('should handle previously marked dupes', async () => {
      const { currentBatchLeads } = setup()

      const lead0 = currentBatchLeads[0]
      lead0.baseRunVariables[1].value = true

      const groups = buildBaseRunGroupsByAddress(currentBatchLeads)
      const { duplicateBaseRuns, nonDuplicateBaseRuns } = getDuplicatesInGroups(groups)

      const duplicateIds = map('id', duplicateBaseRuns).sort()
      const nonDuplicateIds = map('id', nonDuplicateBaseRuns).sort()

      // Don't need to mark 'feaf0b55-1c89-4b6b-b353-49feb3859fbc' as a dupe because it already is
      const expectedDupIds = [
        '9aaed432-0544-4f4b-938e-4d582f70259d',
        'd0b3b524-5027-4846-ba68-500ded6ded21',
      ]
      const expectedNonDupIds = [
        '0a982225-fa6a-4bb6-bacd-a40b29f8fe70',
        '941101ce-4a61-4733-9969-1a943500ae34',
        'abcf0b55-1c89-4b6b-b353-49feb3859abc',
      ]

      expect(duplicateIds).to.deep.equal(expectedDupIds)
      expect(nonDuplicateIds).to.deep.equal(expectedNonDupIds)
    })

    it('should handle previously marked non-dupes', async () => {
      const { currentBatchLeads } = setup()

      const lead0 = currentBatchLeads[0]
      lead0.baseRunVariables[1].value = false

      const groups = buildBaseRunGroupsByAddress(currentBatchLeads)
      const { duplicateBaseRuns, nonDuplicateBaseRuns } = getDuplicatesInGroups(groups)

      const duplicateIds = map('id', duplicateBaseRuns).sort()
      const nonDuplicateIds = map('id', nonDuplicateBaseRuns).sort()

      // 'feaf0b55-1c89-4b6b-b353-49feb3859fbc' is marked as a non-dupe,
      // so mark '941101ce-4a61-4733-9969-1a943500ae34' and '9aaed432-0544-4f4b-938e-4d582f70259d' as dupe
      const expectedDupIds = [
        '941101ce-4a61-4733-9969-1a943500ae34',
        '9aaed432-0544-4f4b-938e-4d582f70259d',
        'd0b3b524-5027-4846-ba68-500ded6ded21',
      ]
      const expectedNonDupIds = [
        '0a982225-fa6a-4bb6-bacd-a40b29f8fe70',
        'abcf0b55-1c89-4b6b-b353-49feb3859abc',
      ]

      expect(duplicateIds).to.deep.equal(expectedDupIds)
      expect(nonDuplicateIds).to.deep.equal(expectedNonDupIds)
    })

    it('should handle previously marked dupes (all dupes in group)', async () => {
      const { currentBatchLeads } = setup()

      each((lead) => (lead.baseRunVariables[1].value = true), currentBatchLeads)

      const groups = buildBaseRunGroupsByAddress(currentBatchLeads)
      const { duplicateBaseRuns, nonDuplicateBaseRuns } = getDuplicatesInGroups(groups)

      const duplicateIds = map('id', duplicateBaseRuns).sort()
      const nonDuplicateIds = map('id', nonDuplicateBaseRuns).sort()

      expect(duplicateIds).to.deep.equal([])
      expect(nonDuplicateIds).to.deep.equal([])
    })

    it('should handle previously marked non-dupes (all non-dupes in group)', async () => {
      const { currentBatchLeads } = setup()

      const updatedBatch = map((lead) => {
        lead.baseRunVariables[1].value = false
        return lead
      }, currentBatchLeads)

      const groups = buildBaseRunGroupsByAddress(updatedBatch)
      const { duplicateBaseRuns, nonDuplicateBaseRuns } = getDuplicatesInGroups(groups)

      const duplicateIds = map('id', duplicateBaseRuns).sort()
      const nonDuplicateIds = map('id', nonDuplicateBaseRuns).sort()

      const expectedDupIds = [
        '9aaed432-0544-4f4b-938e-4d582f70259d',
        'd0b3b524-5027-4846-ba68-500ded6ded21',
        'feaf0b55-1c89-4b6b-b353-49feb3859fbc',
      ]

      expect(duplicateIds).to.deep.equal(expectedDupIds)
      expect(nonDuplicateIds).to.deep.equal([])
    })
  })

  describe('getNullDupeBaseRuns', () => {
    it('should get the base runs that have a null duplicate variable value', async () => {
      const { currentBatchLeads } = setup()
      currentBatchLeads[0].baseRunVariables[1].value = true

      const actual = getNullDupeBaseRuns(currentBatchLeads)

      const actualIds = map('id', actual).sort()

      const expected = [
        '0a982225-fa6a-4bb6-bacd-a40b29f8fe70',
        '941101ce-4a61-4733-9969-1a943500ae34',
        '95ee87be-1e8a-4e30-8cf9-04ec8b08aedf',
        '9aaed432-0544-4f4b-938e-4d582f70259d',
        'abcf0b55-1c89-4b6b-b353-49feb3859abc',
        'd0b3b524-5027-4846-ba68-500ded6ded21',
        'd0bc0f0a-1c91-4f53-b3c4-3e815b1cfd79',
        'dd5ffb71-74e1-4468-8177-1c258daae225',
      ]

      expect(actualIds).to.deep.eq(expected)
      expect(expected).to.not.include(currentBatchLeads[0].id)
    })
  })

  describe('getFalseDupeBaseRuns', () => {
    it('should get the base runs that have a false duplicate variable value', async () => {
      const { currentBatchLeads } = setup()
      currentBatchLeads[0].baseRunVariables[1].value = true
      currentBatchLeads[1].baseRunVariables[1].value = false
      currentBatchLeads[2].baseRunVariables[1].value = false

      const actual = getFalseDupeBaseRuns(currentBatchLeads)

      const actualIds = map('id', actual).sort()

      const expected = [currentBatchLeads[1].id, currentBatchLeads[2].id].sort()

      expect(actualIds).to.deep.eq(expected)
      expect(expected).to.not.include(currentBatchLeads[0].id)
    })
  })

  describe('filterByDupeValue', () => {
    it('should create a function that filters the base runs by the given dupe variable value', async () => {
      const { currentBatchLeads } = setup()
      currentBatchLeads[0].baseRunVariables[1].value = true
      currentBatchLeads[1].baseRunVariables[1].value = true
      currentBatchLeads[2].baseRunVariables[1].value = false

      const actual = filterByDupeValue(true)(currentBatchLeads)

      const actualIds = map('id', actual).sort()

      const expected = [currentBatchLeads[0].id, currentBatchLeads[1].id].sort()

      expect(actualIds).to.deep.eq(expected)
    })
  })
})
