import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { categoriesQuery } from '../api/categories'
import { createExpense } from '../api/expenses'
import { ApiError } from '../api/http'
import { today } from '../lib/format'
import { inputClass } from '../lib/styles'
import { CategoryPicker } from './CategoryPicker'
import { FieldError } from './FieldError'

export function ExpenseForm() {
  const queryClient = useQueryClient()
  const { data: categories = [] } = useQuery(categoriesQuery)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  // Controlled, so a newly created category can be selected from code
  const [categoryId, setCategoryId] = useState('')
  const selectedId = categoryId || String(categories[0]?.id ?? '') // first category until the user picks one

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      setErrors({})
      queryClient.invalidateQueries({ queryKey: ['expenses'] }) // list AND summary
    },
    onError: (error) => {
      setErrors(error instanceof ApiError && error.problem.errors
        ? error.problem.errors
        : { form: ['Could not save the expense. Please try again.'] })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    mutation.mutate(
      {
        description: String(data.get('description')),
        amount: Number(data.get('amount')),
        categoryId: Number(selectedId),
        date: String(data.get('date')),
      },
      { onSuccess: () => form.reset() },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4" noValidate>
      <h2 className="font-semibold text-slate-900">New expense</h2>
      <div>
        <label htmlFor="description" className="text-sm font-medium text-slate-700">Description</label>
        <input id="description" name="description" className={inputClass} placeholder="Groceries" />
        <FieldError messages={errors.Description} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="text-sm font-medium text-slate-700">Amount ($)</label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" className={inputClass} />
          <FieldError messages={errors.Amount} />
        </div>
        <div>
          <label htmlFor="date" className="text-sm font-medium text-slate-700">Date</label>
          <input id="date" name="date" type="date" defaultValue={today()} max={today()} className={inputClass} />
          <FieldError messages={errors.Date} />
        </div>
      </div>
      <CategoryPicker value={selectedId} onChange={setCategoryId} />
      <FieldError messages={errors.CategoryId} />
      <FieldError messages={errors.form} />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {mutation.isPending ? 'Saving…' : 'Add'}
      </button>
    </form>
  )
}