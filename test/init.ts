import './stubs/heimdall'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import * as dotenv from 'dotenv'
import * as path from 'path'

chai.use(chaiAsPromised)
dotenv.config({ path: path.resolve(process.cwd(), 'env.local') })
;(process.env as any).NODE_ENV = 'test'

process
  .on('uncaughtException', (err) => console.log(err)) // eslint-disable-line no-console
  .on('unhandledRejection', (err) => console.log(err)) // eslint-disable-line no-console
