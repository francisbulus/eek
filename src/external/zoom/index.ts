import { get } from 'lodash/fp'
import superagent from 'superagent'

import { ZOOM_URL } from '../../config/env'
import { token } from './auth'

export const setMeetingPassword = ({
  meetingId,
  password,
}: {
  meetingId: string
  password: string
}) =>
  superagent
    .patch(`${ZOOM_URL}/meetings/${meetingId}`)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .send({ password })
    .then(get('status'))
