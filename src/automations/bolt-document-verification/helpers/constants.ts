export const SELFIE_STEP_ID = 'b87d2721-6473-4067-af6e-876e103009ae'

export const STATUSES = ['pass', 'fail', 'unknown']
export const ID_FAILURE_REASONS = ['front', 'back', 'none', 'unknown']
export const SELFIE_FAILURE_REASONS = ['front', 'selfie', 'none', 'unknown']
export const DATA_SHEET_INDIVIDUAL = 'Invisible check ind'
export const DATA_SHEET_FLEET = 'Invisible check fleet'
export const DATA_RANGE_INDIVIDUAL = 'A:T'
export const DATA_RANGE_FLEET = 'A:Q'

export const NO_SCREENSHOT = 'http://www.noscreenshot.com'

export const DATA_COLUMNS_INDIVIDUAL = [
  'ref',
  'subscriptionDate',
  'name',
  'surname',
  'email',
  'phone',
  'nif',
  'accountRecipient',
  'selfieWithId',
  'idFront',
  'idBack',
  'criminalRecordURL',
  'selfEmploymentDoc',
  'iban',
  'ibanProof',
  'verificationAgentName',
  'verificationDate',
  'verificationStatus',
  'verificationFailureReason',
]

export const DATA_COLUMNS_FLEET = [
  'ref',
  'subscriptionDate',
  'name',
  'surname',
  'email',
  'phone',
  'nif',
  'nifProof',
  'selfieWithId',
  'idFront',
  'idBack',
  'criminalRecordURL',
  'verificationAgentName',
  'verificationDate',
  'verificationStatus',
  'verificationFailureReason',
]

export const DATA_RANGE_OUTPUT_INDIVIDUAL = 'P<ROW>:T<ROW>'
export const DATA_RANGE_OUTPUT_FLEET = 'M<ROW>:Q<ROW>'

export const MAX_CASES = 25
