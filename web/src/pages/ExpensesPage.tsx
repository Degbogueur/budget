import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { categoriesQuery } from '../api/categories'
import { expenseQueries } from '../api/expenses'
import { ExpenseList } from '../components/ExpenseList'
import { MonthSummary } from '../components/MonthSummary'
import { currentMonth } from '../lib/format'

export function ExpensesPage() {
  const [month, setMonth] = useState(currentMonth())
  const [categoryId, setCategoryId] = useState('')

  const list = useQuery(expenseQueries.list(month, categoryId))
  const summary = useQuery(expenseQueries.summary(month))
  const { data: categories = [] } = useQuery(categoriesQuery)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <h1 className="mr-auto text-2xl font-bold text-slate-900">My expenses</h1>
          <label className="text-sm">
            <span className="block text-slate-500">Month</span>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1" />
          </label>
          <label className="text-sm">
            <span className="block text-slate-500">Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1">
              <option value="">All</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>

        {list.isPending && <p className="text-slate-500">Loading…</p>}
        {list.isError && <p role="alert" className="text-red-600">Could not load expenses.</p>}
        {list.data && <ExpenseList expenses={list.data} />}
      </section>

      <aside className="space-y-6">
        {summary.data && <MonthSummary summary={summary.data} />}
      </aside>
    </div>
  )
}