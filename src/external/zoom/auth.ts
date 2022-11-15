import * as jwt from 'jsonwebtoken'

import { ZOOM_API_KEY, ZOOM_SECRET } from '../../config/env'

const payload = {
  iss: ZOOM_API_KEY,
  // short period of time to prevent replay attacks (https://marketplace.zoom.us/docs/guides/auth/jwt)
  exp: new Date().getTime() + 5000,
}

export const token = jwt.sign(payload, ZOOM_SECRET)
