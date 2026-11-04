import type { Expense } from '../api/expenses'
import { formatDate, formatMoney } from '../lib/format'

type ExpenseListProps = {
  expenses: Expense[]
  onDelete?: (id: number) => void
  deletingId?: number | null
}

export function ExpenseList({ expenses, onDelete, deletingId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">No expenses for this period.</p>
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-900">{expense.description}</p>
            <p className="text-sm text-slate-500">
              {expense.category} · {formatDate(expense.date)}
            </p>
          </div>
          <span className="font-semibold tabular-nums text-slate-900">{formatMoney(expense.amount)}</span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(expense.id)}
              disabled={deletingId === expense.id}
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              aria-label={`Delete ${expense.description}`}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}