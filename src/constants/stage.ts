import { map, values } from 'lodash/fp'

const STAGES = {
  ROUTING: { id: 1, name: 'Routing' },
  SCOPING: { id: 2, name: 'Scoping' },
  OPERATING: { id: 3, name: 'Operating' },
  QA: { id: 4, name: 'QA' },
  DELIVERING: { id: 5, name: 'Delivering' },
  DONE: { id: 6, name: 'Done' },
} as const

const _STAGES = values(STAGES)
const _STAGE_NAMES = map(({ name }) => name, _STAGES)
const _STAGE_IDS = map(({ id }) => id, _STAGES)

type TStageId = typeof _STAGE_IDS[number]

export { _STAGE_IDS, _STAGE_NAMES, _STAGES, STAGES }
export type { TStageId }
