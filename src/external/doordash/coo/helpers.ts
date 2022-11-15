import { ultron } from '../../../external/ultron'

const checkForActiveBaseRun = async (value: string) => {
  let active = false

  const baseRuns = await ultron.baseRun.findMany({
    where: {
      baseId: '548ef6a9-dac4-4416-b00e-c68368244960', // COO Cases Base ID in Manticore
      baseRunVariables: { some: { value: { equals: value, path: [] } } },
      status: 'pending',
    },
  })

  if (baseRuns.length > 0) active = true

  return active
}

export { checkForActiveBaseRun }
