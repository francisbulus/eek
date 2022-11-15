import { apolloClient } from '../../../src/config/apollo'
import { StepRunDocument } from '../../../src/generated/graphql'

const findById = async (id: number, bustCache = true) =>
  (
    await apolloClient.query({
      query: StepRunDocument,
      variables: { id, bustCache },
    })
  )?.data?.stepRun

const StepRun = { findById }

export { StepRun }
