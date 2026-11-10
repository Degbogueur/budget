import { queryOptions } from '@tanstack/react-query'
import { ApiError, http } from './http'

export type User = { email: string }
export type Credentials = { email: string; password: string }

export const meQuery = queryOptions({
  queryKey: ['me'],
  // 401 = not signed in: return null instead of an error
  queryFn: async () => {
    try {
      return await http<User>('/api/auth/me')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },
  staleTime: Infinity,
})

export function login(credentials: Credentials) {
  // useCookies=true: the API sets an HttpOnly cookie, nothing to store in JavaScript
  return http<void>('/api/auth/login?useCookies=true', { method: 'POST', body: JSON.stringify(credentials) })
}

export function register(credentials: Credentials) {
  return http<void>('/api/auth/register', { method: 'POST', body: JSON.stringify(credentials) })
}

export function logout() {
  return http<void>('/api/auth/logout', { method: 'POST' })
}