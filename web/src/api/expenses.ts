import { queryOptions } from '@tanstack/react-query'
import { http } from './http'

export type Expense = {
  id: number
  description: string
  amount: number
  categoryId: number
  category: string
  date: string 
}

export type SaveExpense = {
  description: string
  amount: number
  categoryId: number
  date?: string
}

export type MonthSummary = {
  month: string
  total: number
  count: number
  byCategory: { category: string; total: number }[]
}

export const expenseQueries = {
  // Every key starts with 'expenses': invalidating ['expenses'] refreshes them all
  list: (month: string, categoryId: string) =>
    queryOptions({
      queryKey: ['expenses', 'list', { month, categoryId }],
      queryFn: () => {
        const params = new URLSearchParams({ month })
        if (categoryId) params.set('categoryId', categoryId)
        return http<Expense[]>(`/api/expenses?${params}`)
      },
    }),
  summary: (month: string) =>
    queryOptions({
      queryKey: ['expenses', 'summary', month],
      queryFn: () => http<MonthSummary>(`/api/expenses/summary?month=${month}`),
    }),
}