import { Brand } from 'utility-types'

import { Mustache } from './mustache'
import { renderSheetValue } from './sheetValue'
import { renderTabName } from './tabName'

type TMustacheTemplate = Brand<string, 'TMustacheTemplate'>

// Tags default to ['{{', '}}']
// Can be overridden by setting Mustache.tags
// See: https://www.npmjs.com/package/mustache#custom-delimiters
const isMustacheTemplate = (s: string): s is TMustacheTemplate => s.includes(Mustache.tags[0])

export { isMustacheTemplate, Mustache, renderSheetValue, renderTabName }
export type { TMustacheTemplate }
