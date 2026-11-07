import type { MonthSummary as Summary } from '../api/expenses'
import { formatMoney } from '../lib/format'

export function MonthSummary({ summary }: { summary: Summary }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">Monthly total · {summary.count} expense(s)</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900" data-testid="total">
        {formatMoney(summary.total)}
      </p>
      <ul className="mt-4 space-y-2">
        {summary.byCategory.map((c) => (
          <li key={c.category}>
            <div className="flex justify-between text-sm">
              <span>{c.category}</span>
              <span className="tabular-nums">{formatMoney(c.total)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded bg-slate-100">
              <div className="h-1.5 rounded bg-indigo-500" style={{ width: `${(c.total / summary.total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}