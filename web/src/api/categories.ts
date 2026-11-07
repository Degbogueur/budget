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