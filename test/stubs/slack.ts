import sinon from 'sinon'

import { TSlackUser } from '../../src/external/slack/types'

const members: TSlackUser[] = [
  {
    id: 'UHCRE7JHG',
    team_id: 'THSN86QS1',
    name: 'rene.arias',
    deleted: false,
    color: 'e96699',
    real_name: 'René Arias',
    tz: 'America/Chicago',
    tz_label: 'Central Standard Time',
    tz_offset: -21600,
    profile: {
      title: 'Sentry Team',
      phone: '(619) 947-0007',
      skype: '',
      real_name: 'René Arias',
      real_name_normalized: 'Rene Arias',
      display_name: 'René Arias',
      display_name_normalized: 'Rene Arias',
      fields: null,
      status_text: '',
      status_emoji: '',
      status_expiration: 0,
      avatar_hash: '09cc4e171878',
      image_original:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_original.png',
      is_custom_image: true,
      email: 'rene@mail.com',
      first_name: 'René',
      last_name: 'Arias',
      image_24:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_24.png',
      image_32:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_32.png',
      image_48:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_48.png',
      image_72:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_72.png',
      image_192:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_192.png',
      image_512:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_512.png',
      image_1024:
        'https://avatars.slack-edge.com/2019-10-03/784530563351_09cc4e171878b3f7f744_1024.png',
      status_text_canonical: '',
      team: 'THSN86QS1',
    },
    is_admin: true,
    is_owner: true,
    is_primary_owner: false,
    is_restricted: false,
    is_ultra_restricted: false,
    is_bot: false,
    is_app_user: false,
    updated: 1607363820,
    is_email_confirmed: true,
  },

  {
    id: 'UHFTR4G58',
    team_id: 'THSN86QS1',
    name: 'matteo.ghironi',
    deleted: false,
    color: 'bb86b7',
    real_name: 'Matteo Ghironi',
    tz: 'Europe/Amsterdam',
    tz_label: 'Central European Time',
    tz_offset: 3600,
    profile: {
      title: 'Delivery Manager',
      phone: '+39 388 821 2554',
      skype: '',
      real_name: 'Matteo Ghironi',
      real_name_normalized: 'Matteo Ghironi',
      display_name: 'Matteo Ghironi',
      display_name_normalized: 'Matteo Ghironi',
      fields: null,
      status_text: 'In a meeting • Google Calendar',
      status_emoji: ':spiral_calendar_pad:',
      status_expiration: 1615471200,
      avatar_hash: '5fbcbe4f9099',
      image_original:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_original.jpg',
      is_custom_image: true,
      email: 'matteo@mail.com',
      first_name: 'Matteo',
      last_name: 'Ghironi',
      image_24:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_24.jpg',
      image_32:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_32.jpg',
      image_48:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_48.jpg',
      image_72:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_72.jpg',
      image_192:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_192.jpg',
      image_512:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_512.jpg',
      image_1024:
        'https://avatars.slack-edge.com/2020-11-25/1525040946565_5fbcbe4f90990dfd4f3e_1024.jpg',
      status_text_canonical: '',
      team: 'THSN86QS1',
    },
    is_admin: true,
    is_owner: false,
    is_primary_owner: false,
    is_restricted: false,
    is_ultra_restricted: false,
    is_bot: false,
    is_app_user: false,
    updated: 1615468501,
    is_email_confirmed: true,
  },
  {
    id: 'UHEJPGLV8',
    team_id: 'THSN86QS1',
    name: 'gabriela.benitez',
    deleted: true,
    profile: {
      title: '',
      phone: '',
      skype: '',
      real_name: 'Gabriela Benitez',
      real_name_normalized: 'Gabriela Benitez',
      display_name: 'Gabriela Benitez',
      display_name_normalized: 'Gabriela Benitez',
      fields: null,
      status_text: '',
      status_emoji: '',
      status_expiration: 0,
      avatar_hash: 'a681600440be',
      image_original:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_original.jpg',
      is_custom_image: true,
      email: 'gabriela.benitez@mail.com',
      first_name: 'Gabriela',
      last_name: 'Benitez',
      image_24:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_24.jpg',
      image_32:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_32.jpg',
      image_48:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_48.jpg',
      image_72:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_72.jpg',
      image_192:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_192.jpg',
      image_512:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_512.jpg',
      image_1024:
        'https://avatars.slack-edge.com/2019-04-11/599496487249_a681600440becfdda47b_1024.jpg',
      status_text_canonical: '',
      team: 'THSN86QS1',
    },
    is_bot: false,
    is_app_user: false,
    updated: 1559579896,
  },
]

const slackBotStub = {
  chat: {
    postMessage: sinon.stub().resolves(),
  },
  conversations: {
    list: sinon.stub().resolves(),
  },
  users: {
    list: sinon.stub().resolves({
      members,
    }),
  },
}

export { slackBotStub }
