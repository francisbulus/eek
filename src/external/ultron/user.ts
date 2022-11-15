import { User } from '../../helpers/types'
import { ultronGet } from './helpers'

/**
 * Finds a user by email
 */
const findByEmail = async ({ email }: { email: string }): Promise<User> =>
  await ultronGet({ path: `user/find-by-email/${email}` })

/**
 * Get all Invisible users from the ultron DB
 */
const getAllInvisibleUsers = async (): Promise<User[]> =>
  await ultronGet({ path: 'user/get-invisible-users' })

const user = { findByEmail, getAllInvisibleUsers }

export { user }
