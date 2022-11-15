import { filter, find, isEmpty, map } from 'lodash'

import { ultron } from '../../../external/ultron'

const validateGrubhubUsers = async ({
  arrayOfUsers,
}: {
  arrayOfUsers: { Name: string; Email: string }[]
}) => {
  const allInvisibleUsers = await ultron.user.getAllInvisibleUsers()

  const validUsers = map(
    filter(arrayOfUsers, (user) => user.Email.split('@')[1] === 'invisible.email'),
    (user) => {
      if (!find(allInvisibleUsers, { email: user.Email })) return
      return {
        Name: user.Name,
        Email: user.Email,
      }
    }
  )

  return filter(validUsers, (user) => !isEmpty(user))
}

export { validateGrubhubUsers }
