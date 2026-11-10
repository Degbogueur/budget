import { queryOptions } from '@tanstack/react-query'
import { http } from './http'

export type Category = {
  id: number
  name: string
  isCustom: boolean
}

export const categoriesQuery = queryOptions({
  queryKey: ['categories'],
  queryFn: () => http<Category[]>('/api/categories'),
  staleTime: Infinity,
})

export function createCategory(name: string) {
  return http<Category>('/api/categories', { method: 'POST', body: JSON.stringify({ name }) })
}