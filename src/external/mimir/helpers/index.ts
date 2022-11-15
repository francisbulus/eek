import { MIDGARD_URL } from '../../../config/env'

const dalInstanceUrl = (instanceId: number) => `${MIDGARD_URL}/instance/${instanceId}`

export { dalInstanceUrl }
