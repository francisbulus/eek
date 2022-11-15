import * as heimdall from '@invisible/heimdall'
import { set } from 'lodash/fp'
import sinon from 'sinon'

const fakeAuthenticatedUser = {
  name: 'Test',
  email: 'fake@test.com',
  user_id: 'google-auth2|12313432423',
}

const roles = ['nidavellir', 'manticore', 'lambda']

const middleware = async (req: any, _res: any, next: any) => {
  Object.assign(req, {
    user: set('app_metadata.authorization.roles', roles, fakeAuthenticatedUser),
    userId: 47, // userId starts on id === 47 because of default DM.
    userCategory: 'Admin',
  })
  next()
}

const hasRoleStub = sinon.stub(heimdall, 'hasRole').callsFake(() => middleware)

export { hasRoleStub }
