import { filter, flatten, flow, get, isArray, map } from 'lodash/fp'
import Mustache from 'mustache'

// By default, Mustache will HTML-escape all rendered values
// We're not using Mustache in a HTML context, so we disable this globally
Mustache.escape = (text: string) => text

type TMustacheToken = ['#' | 'text' | 'name', string, number, number, undefined | TMustacheToken[]]

const extractVariableNames = (parsed?: TMustacheToken[]) => {
  const level1VarNames = flow(
    filter(isArray),
    filter((token: TMustacheToken) => token[0] === 'name'),
    map(get('1'))
  )(parsed) as string[]

  const recursiveVarNames = flow(
    filter(isArray),
    filter((token: TMustacheToken) => token[0] === '#'),
    map((token: TMustacheToken) => extractVariableNames(token[4])),
    flatten
  )(parsed) as string[]

  return [...level1VarNames, ...recursiveVarNames]
}

const extractVariableNamesFromTemplate = (template: string) => {
  const parsed = Mustache.Writer.prototype.parse(template)
  return extractVariableNames(parsed)
}

export { extractVariableNames, extractVariableNamesFromTemplate, Mustache }
