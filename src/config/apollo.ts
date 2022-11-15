import { ResultOf, VariablesOf } from '@graphql-typed-document-node/core'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloClient, DefaultOptions } from 'apollo-client'
import { ApolloQueryResult } from 'apollo-client/core/types'
import { FetchPolicy, QueryBaseOptions } from 'apollo-client/core/watchQueryOptions'
import { createHttpLink } from 'apollo-link-http'
import { DocumentNode } from 'graphql'
import fetch from 'isomorphic-unfetch'

import { AUTOMATIONS_TOKEN, MIMIR_URL } from './env'

// Declaring these here so that the client has proper typing on the results of queries
export interface MyQueryBaseOptions<TDocument extends DocumentNode>
  extends QueryBaseOptions<VariablesOf<TDocument>> {
  query: TDocument
  variables?: VariablesOf<TDocument>
}

export interface MyQueryOptions<TDocument extends DocumentNode>
  extends MyQueryBaseOptions<TDocument> {
  fetchPolicy?: FetchPolicy
}

const link = createHttpLink({
  uri: `${MIMIR_URL}/graphql`,
  fetch,
  headers: {
    authorization: `Basic ${AUTOMATIONS_TOKEN}`,
  },
})

interface IApolloClient extends Without<ApolloClient<NormalizedCacheObject>, 'query'> {
  query<T extends DocumentNode>(options: MyQueryOptions<T>): Promise<ApolloQueryResult<ResultOf<T>>>
}

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

const apolloClient = new ApolloClient({
  link,
  defaultOptions,
  cache: new InMemoryCache(),
}) as IApolloClient

export { apolloClient, link }
