import { User } from '../../helpers/types'
import { userServicePost } from './helpers'

/**
 * Find a user by id
 */
const findById = async (id: string): Promise<User> =>
  userServicePost({ path: `users`, body: { data: { id }, type: 'GET' } }).then(([user]) => user)

/**
 * Find a user by email
 */
const findByEmail = async (email: string): Promise<User> =>
  userServicePost({ path: `users`, body: { data: { email }, type: 'GET' } }).then(([user]) => user)

/**
 * Find many users
 */
const findMany = async (where: Record<string, any>): Promise<User> =>
  userServicePost({ path: `users`, body: { data: where, type: 'GET' } })

const userService = {
  findById,
  findByEmail,
  findMany,
}

export { userService }
