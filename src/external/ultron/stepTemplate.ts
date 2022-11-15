import { TStepTemplate } from 'src/services/computeHandlers'

import { ultronGet, ultronPost } from './helpers'

const createStepTemplate = async ({
  id,
  name,
  description,
  path,
  type,
  tags,
  variables,
  synchronous,
  source,
}: TStepTemplate) =>
  ultronPost({
    path: 'step-template',
    body: { id, name, description, type, tags, variables, synchronous, path, source },
  })

const getPaths = async (): Promise<{ id: string; path: string }[]> =>
  await ultronGet({ path: 'step-template/paths' })

const stepTemplate = { createStepTemplate, getPaths }

export { stepTemplate }
