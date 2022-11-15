import { oneLine } from 'common-tags'
import { flatten, isEmpty, map, pick, size, take, toLower } from 'lodash/fp'
import pAll from 'p-all'
import pThrottle from 'p-throttle'
import superagent from 'superagent'

import { GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX } from '../../config/env'

const SECOND_IN_MS = 1000
const QUERIES_PER_SECOND = 10

const throttle = pThrottle({
  limit: QUERIES_PER_SECOND,
  interval: SECOND_IN_MS,
})

const throttledGoogleSearch = throttle(async (url: string) =>
  superagent.get(url).set('Accept', 'application/json')
)

const generateGoogleSearchUrl = ({
  keyword,
  startIndex,
}: {
  keyword: string
  startIndex?: number
}) =>
  oneLine`https://www.googleapis.com/customsearch/v1?q=${toLower(
    keyword
  )}&key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&startIndex=${startIndex ?? 1}`

const paginatedGoogleSearch = async ({
  keyword,
  limitOfResultsPerKeyword,
}: {
  keyword: string
  limitOfResultsPerKeyword?: number | null
}) => {
  const url = generateGoogleSearchUrl({ keyword })

  const result = await throttledGoogleSearch(url)
  let items = result.body?.items ?? []

  if (isEmpty(items)) return items

  if (limitOfResultsPerKeyword && limitOfResultsPerKeyword > 10) {
    while (size(items) <= limitOfResultsPerKeyword) {
      // If the total results on a search was reached, return all available results.
      const totalResults = result.body?.queries?.request[0]?.totalResults
      if (size(items) === totalResults) return items

      const nextPageStartIndex = result.body?.queries?.nextPage[0]?.startIndex
      const nextPageUrl = generateGoogleSearchUrl({ keyword, startIndex: nextPageStartIndex })
      const nextPageResult = await throttledGoogleSearch(nextPageUrl)
      const nextPageItems = nextPageResult?.body?.items ?? []

      items = [...items, ...nextPageItems]
    }
  }

  return items
}

const searchKeyword = (limitOfResultsPerKeyword?: number | null) => (
  keyword: string
) => async () => {
  const items: SearchAPIResult[] = await paginatedGoogleSearch({
    keyword,
    limitOfResultsPerKeyword,
  })

  const itemsWithKeyword = map(
    (item) => ({
      ...pick(['title', 'link', 'displayLink', 'snippet'], item),
      keyword,
    }),
    items
  )
  if (limitOfResultsPerKeyword) return take(limitOfResultsPerKeyword, itemsWithKeyword)
  return itemsWithKeyword
}

interface SearchAPIResult {
  link: string
  title: string
  snippet: string
  displayLink: string
}

const search = async ({
  keywords,
  limitOfResultsPerKeyword = 10,
}: {
  keywords: string[]
  limitOfResultsPerKeyword?: number | null
}): Promise<(SearchAPIResult & { keyword: string })[] | undefined> => {
  if (limitOfResultsPerKeyword === 0)
    throw new Error('Limit of Results per Keyword can not be zero.')

  const resultsPerKeyword = await pAll(map(searchKeyword(limitOfResultsPerKeyword), keywords), {
    concurrency: 10,
  })

  return flatten(resultsPerKeyword)
}

export { search }
