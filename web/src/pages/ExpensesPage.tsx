import { useState } from 'react'
import type { Expense } from '../api/expenses'
import { ExpenseList } from '../components/ExpenseList'
import { CATEGORIES, formatMoney } from '../lib/format'

const SAMPLE: Expense[] = [
  { id: 1, description: 'Save-On-Foods groceries', amount: 86.4, category: 'Food', date: '2026-11-02' },
  { id: 2, description: 'November rent', amount: 1450, category: 'Housing', date: '2026-11-01' },
  { id: 3, description: 'ETS bus pass', amount: 100, category: 'Transport', date: '2026-11-01' },
  { id: 4, description: 'Remedy coffee', amount: 6.25, category: 'Food', date: '2026-11-03' },
]

export function ExpensesPage() {
  const [expenses, setExpenses] = useState(SAMPLE)
  const [category, setCategory] = useState('')

  // Derived values: recomputed on every render, never stored in state
  const visible = category ? expenses.filter((e) => e.category === category) : expenses
  const total = visible.reduce((sum, e) => sum + e.amount, 0)

  function handleDelete(id: number) {
    setExpenses(expenses.filter((e) => e.id !== id)) // new array, never splice
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-2xl font-bold text-slate-900">My expenses</h1>
        <label className="text-sm">
          <span className="block text-slate-500">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1">
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-lg">Total: <strong className="tabular-nums">{formatMoney(total)}</strong></p>
      <ExpenseList expenses={visible} onDelete={handleDelete} />
    </section>
  )
}