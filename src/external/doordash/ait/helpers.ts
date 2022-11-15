import { ultron } from '../../../external/ultron'

const checkForActiveBaseRun = async (value: string) => {
  let active = false

  const baseRuns = await ultron.baseRun.findMany({
    where: {
      baseId: '7013ffce-1609-4fd5-a62c-cd76766c4b0a', // AIT Cases Base ID in Manticore
      baseRunVariables: { some: { value: { equals: value, path: [] } } },
      status: 'pending',
    },
  })

  if (baseRuns.length > 0) active = true

  return active
}

export { checkForActiveBaseRun }
