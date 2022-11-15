import { map, values } from 'lodash/fp'

const STEP_TEMPLATE_CATEGORIES = {
  CORE: { id: 1, name: '_Core', description: '' },
  AGENT_WORKSTATION: { id: 2, name: 'Agent Workstation', description: '' },
  AIRTABLE: { id: 3, name: 'Airtable', description: '' },
  API_3RD_PARTY: { id: 4, name: 'Api/3rd party', description: '' },
  BREEZY: { id: 5, name: 'Breezy', description: '' },
  BROWSER_ACTIONS: { id: 6, name: 'Browser actions', description: '' },
  CALENDAR: { id: 7, name: 'Calendar', description: '' },
  COMMS: { id: 8, name: 'Comms', description: '' },
  DAL: { id: 9, name: 'Dal', description: '' },
  DATA_SOURCING_ENTRY: { id: 10, name: 'Data Sourcing & entry', description: '' },
  DOCUMENT_FILES: { id: 11, name: 'Document & Files', description: '' },
  GOOGLE_SEARCH: { id: 12, name: 'Google Search', description: '' },
  IDENTITY: { id: 13, name: 'Identity', description: '' },
  LINKEDIN: { id: 14, name: 'LinkedIn', description: '' },
  LOGIC_FLOW: { id: 15, name: 'Logic Flow', description: '' },
  MANUAL: { id: 16, name: 'Manual', description: '' },
  MISC: { id: 17, name: 'Misc.', description: '' },
  SPREADSHEET: { id: 18, name: 'Spreadsheet', description: '' },
  BAD: { id: 19, name: 'Bad', description: '' },
} as const

const _STEP_TEMPLATE_CATEGORIES = values(STEP_TEMPLATE_CATEGORIES)
const _STEP_TEMPLATE_CATEGORY_IDS = map(({ id }) => id, _STEP_TEMPLATE_CATEGORIES)

type TStepTemplateCategoryId = typeof _STEP_TEMPLATE_CATEGORY_IDS[number]

export { _STEP_TEMPLATE_CATEGORIES, _STEP_TEMPLATE_CATEGORY_IDS, STEP_TEMPLATE_CATEGORIES }

export type { TStepTemplateCategoryId }
