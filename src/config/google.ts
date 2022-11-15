import { auth, Credentials, JWT } from 'google-auth-library'
import { google } from 'googleapis'
import { concat, flow, join, map } from 'lodash/fp'

import { lambda } from '../external/lambda'
import { GOOGLE_ADMIN_EMAIL } from './env'

const SCOPES_BASE_URL = 'https://www.googleapis.com/auth'

const SCOPES = map(flow(concat(SCOPES_BASE_URL), join('/')))([
  'admin.directory.user',
  'admin.directory.user.security',
  'drive',
  'drive.file',
  'cloud-platform',
])

const getKeyFile = async (): Promise<string> =>
  Buffer.from(await lambda.getCredential('GOOGLE_SERVICE_ACCOUNT_B64'), 'base64').toString('utf8')

let initialized: Credentials | undefined = undefined

const init = async () => {
  if (initialized) return initialized
  const KEY = JSON.parse(await getKeyFile())
  const client = auth.fromJSON(KEY) as JWT
  client.scopes = SCOPES
  client.subject = GOOGLE_ADMIN_EMAIL
  google.options({ auth: (client as unknown) as string })
  initialized = await client.authorize()
  return initialized
}

export { getKeyFile, google, init }
