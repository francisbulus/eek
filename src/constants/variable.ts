import { includes, values } from 'lodash/fp'

const VARIABLE_GENERIC_TYPES = {
  OBJECT: 'object',
} as const

const VARIABLE_ARRAY_TYPES = {
  ARR_ANY: 'a_any',
  ARR_BOOLEAN: 'a_boolean',
  ARR_DATETIME: 'a_datetime',
  ARR_DURATION: 'a_duration',
  ARR_EMAIL: 'a_email',
  ARR_ENUM: 'a_enum',
  ARR_HTML: 'a_html',
  ARR_NUMBER: 'a_number',
  ARR_OBJECT: 'a_object',
  ARR_STRING: 'a_string',
  ARR_URL: 'a_url',
} as const

const VARIABLE_ARR_ARRAY_TYPES = {
  ARR_ARR_ANY: 'a_a_any',
  ARR_ARR_OBJECT: 'a_a_object',
  ARR_ARR_STRING: 'a_a_string',
} as const

const VARIABLE_NESTED_TYPES = {
  ...VARIABLE_GENERIC_TYPES,
  ...VARIABLE_ARRAY_TYPES,
  ...VARIABLE_ARR_ARRAY_TYPES,
} as const

const VARIABLE_BASIC_TYPES = {
  ANY: 'any',
  BOOLEAN: 'boolean',
  DATETIME: 'datetime',
  DURATION: 'duration',
  EMAIL: 'email',
  ENUM: 'enum',
  HTML: 'html',
  NUMBER: 'number',
  STRING: 'string',
  URL: 'url',
} as const

const VARIABLE_TYPES = {
  ...VARIABLE_BASIC_TYPES,
  ...VARIABLE_NESTED_TYPES,
} as const

const VARIABLE_BASIC_SCHEMAS = {
  [VARIABLE_TYPES.ANY]: {}, // this is a valid json schema. it will match anything
  [VARIABLE_TYPES.BOOLEAN]: { type: 'boolean', PBType: VARIABLE_TYPES.BOOLEAN },

  // We could add format: 'date-time' } but it's too restrictive
  [VARIABLE_TYPES.DATETIME]: { type: 'string', PBType: VARIABLE_TYPES.DATETIME },

  // We could add format: 'duration' } but it's too restrictive
  [VARIABLE_TYPES.DURATION]: { type: 'string', PBType: VARIABLE_TYPES.DURATION },

  [VARIABLE_TYPES.EMAIL]: { type: 'string', PBType: VARIABLE_TYPES.EMAIL, format: 'email' },

  // enums will be treated as string
  // In the future, they can be enforced like this { type: 'string', enum: 'red', 'yellow', 'green' ]}
  [VARIABLE_TYPES.ENUM]: { type: 'string', PBType: VARIABLE_TYPES.ENUM },
  [VARIABLE_TYPES.HTML]: { type: 'string', PBType: VARIABLE_TYPES.HTML },
  [VARIABLE_TYPES.NUMBER]: { type: 'number', PBType: VARIABLE_TYPES.NUMBER },
  [VARIABLE_TYPES.STRING]: { type: 'string', PBType: VARIABLE_TYPES.STRING },
  [VARIABLE_TYPES.URL]: { type: 'string', PBType: VARIABLE_TYPES.URL, format: 'uri' }, // must be a full uri
} as const

const VARIABLE_GENERIC_SCHEMAS = {
  [VARIABLE_TYPES.OBJECT]: { type: 'object', PBType: VARIABLE_TYPES.OBJECT },
} as const

const VARIABLE_ARRAY_SCHEMAS = {
  [VARIABLE_TYPES.ARR_ANY]: { type: 'array', PBType: VARIABLE_TYPES.ARR_ANY },
  [VARIABLE_TYPES.ARR_BOOLEAN]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_BOOLEAN,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.BOOLEAN],
  },
  [VARIABLE_TYPES.ARR_DATETIME]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_DATETIME,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.DATETIME],
  },
  [VARIABLE_TYPES.ARR_DURATION]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_DURATION,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.DURATION],
  },
  [VARIABLE_TYPES.ARR_EMAIL]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_EMAIL,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.EMAIL],
  },
  [VARIABLE_TYPES.ARR_ENUM]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_ENUM,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.ENUM],
  },
  [VARIABLE_TYPES.ARR_HTML]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_HTML,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.HTML],
  },
  [VARIABLE_TYPES.ARR_NUMBER]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_NUMBER,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.NUMBER],
  },
  [VARIABLE_TYPES.ARR_OBJECT]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_OBJECT,
    items: VARIABLE_GENERIC_SCHEMAS[VARIABLE_TYPES.OBJECT],
  },
  [VARIABLE_TYPES.ARR_STRING]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_STRING,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.STRING],
  },
  [VARIABLE_TYPES.ARR_URL]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_URL,
    items: VARIABLE_BASIC_SCHEMAS[VARIABLE_TYPES.URL],
  },
} as const

// We have these for now, but obviously we can get carried away and end up with
// a million levels of nesting
// Eventually, we will need a proper generic type system like typescript
const VARIABLE_ARR_ARRAY_SCHEMAS = {
  [VARIABLE_TYPES.ARR_ARR_ANY]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_ARR_ANY,
    items: VARIABLE_ARRAY_SCHEMAS[VARIABLE_TYPES.ARR_ANY],
  },
  [VARIABLE_TYPES.ARR_ARR_STRING]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_ARR_STRING,
    items: VARIABLE_ARRAY_SCHEMAS[VARIABLE_TYPES.ARR_STRING],
  },
  [VARIABLE_TYPES.ARR_ARR_OBJECT]: {
    type: 'array',
    PBType: VARIABLE_TYPES.ARR_ARR_OBJECT,
    items: VARIABLE_ARRAY_SCHEMAS[VARIABLE_TYPES.ARR_OBJECT],
  },
} as const

const VARIABLE_SCHEMAS = {
  ...VARIABLE_BASIC_SCHEMAS,
  ...VARIABLE_GENERIC_SCHEMAS,
  ...VARIABLE_ARRAY_SCHEMAS,
  ...VARIABLE_ARR_ARRAY_SCHEMAS,
} as const

const VARIABLE_DIRECTIONS = {
  INPUT: 'input',
  OUTPUT: 'output',
} as const

const _VARIABLE_BASIC_TYPES = values(VARIABLE_BASIC_TYPES)
const _VARIABLE_GENERIC_TYPES = values(VARIABLE_GENERIC_TYPES)
const _VARIABLE_ARRAY_TYPES = values(VARIABLE_ARRAY_TYPES)
const _VARIABLE_NESTED_TYPES = values(VARIABLE_NESTED_TYPES)
const _VARIABLE_TYPES = values(VARIABLE_TYPES)

const _VARIABLE_BASIC_SCHEMAS = values(VARIABLE_BASIC_SCHEMAS)
const _VARIABLE_ARRAY_SCHEMAS = values(VARIABLE_ARRAY_SCHEMAS)
const _VARIABLE_GENERIC_SCHEMAS = values(VARIABLE_GENERIC_SCHEMAS)
const _VARIABLE_ARR_ARRAY_SCHEMAS = values(VARIABLE_ARR_ARRAY_SCHEMAS)
const _VARIABLE_SCHEMAS = values(VARIABLE_SCHEMAS)

const _VARIABLE_DIRECTIONS = values(VARIABLE_DIRECTIONS)

const VARIABLE_TYPE_DEFAULT = 'string'

type TSingleParsedVariableValue =
  | number
  | string
  | boolean
  | Record<string, number | string | boolean>
type TParsedVariableValue =
  | TSingleParsedVariableValue
  | TSingleParsedVariableValue[]
  | (number | string | boolean)[][]

type TVariableTypes = typeof _VARIABLE_TYPES[number]
type TVariableDirections = typeof _VARIABLE_DIRECTIONS[number]
type TVariableBasicTypes = typeof _VARIABLE_BASIC_TYPES[number]
type TVariableNestedTypes = typeof _VARIABLE_NESTED_TYPES[number]
type TVariableGenericTypes = typeof _VARIABLE_GENERIC_TYPES[number]
type TVariableArrayTypes = typeof _VARIABLE_ARRAY_TYPES[number]
type TVariableSchemas = typeof _VARIABLE_SCHEMAS[number]
type TVariableArraySchemas = typeof _VARIABLE_ARRAY_SCHEMAS[number]

const isBasicType = (type: string): type is TVariableBasicTypes =>
  includes(type, _VARIABLE_BASIC_TYPES)
const isArrayType = (type: string): type is TVariableArrayTypes =>
  includes(type, _VARIABLE_ARRAY_TYPES)
const isNestedType = (type: string): type is TVariableNestedTypes =>
  includes(type, _VARIABLE_NESTED_TYPES)

export {
  _VARIABLE_ARR_ARRAY_SCHEMAS,
  _VARIABLE_ARRAY_SCHEMAS,
  _VARIABLE_ARRAY_TYPES,
  _VARIABLE_BASIC_SCHEMAS,
  _VARIABLE_BASIC_TYPES,
  _VARIABLE_DIRECTIONS,
  _VARIABLE_GENERIC_SCHEMAS,
  _VARIABLE_GENERIC_TYPES,
  _VARIABLE_NESTED_TYPES,
  _VARIABLE_SCHEMAS,
  _VARIABLE_TYPES,
  isArrayType,
  isBasicType,
  isNestedType,
  VARIABLE_ARR_ARRAY_SCHEMAS,
  VARIABLE_ARR_ARRAY_TYPES,
  VARIABLE_ARRAY_SCHEMAS,
  VARIABLE_ARRAY_TYPES,
  VARIABLE_BASIC_SCHEMAS,
  VARIABLE_BASIC_TYPES,
  VARIABLE_DIRECTIONS,
  VARIABLE_GENERIC_SCHEMAS,
  VARIABLE_GENERIC_TYPES,
  VARIABLE_NESTED_TYPES,
  VARIABLE_SCHEMAS,
  VARIABLE_TYPE_DEFAULT,
  VARIABLE_TYPES,
}

export type {
  TParsedVariableValue,
  TSingleParsedVariableValue,
  TVariableArraySchemas,
  TVariableArrayTypes,
  TVariableBasicTypes,
  TVariableDirections,
  TVariableGenericTypes,
  TVariableNestedTypes,
  TVariableSchemas,
  TVariableTypes,
}
