import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { categoriesQuery, createCategory } from '../api/categories'
import { ApiError } from '../api/http'
import { inputClass } from '../lib/styles'
import { FieldError } from './FieldError'

type CategoryPickerProps = {
  value: string
  onChange: (categoryId: string) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const queryClient = useQueryClient()
  const { data: categories = [] } = useQuery(categoriesQuery)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string[]>()

  const create = useMutation({
    mutationFn: createCategory,
    onSuccess: async (category) => {
      await queryClient.invalidateQueries({ queryKey: categoriesQuery.queryKey })
      onChange(String(category.id)) // select the new category right away
      setName('')
      setAdding(false)
      setError(undefined)
    },
    onError: (e) => {
      setError(e instanceof ApiError && e.problem.errors?.Name ? e.problem.errors.Name : ['Could not create the category.'])
    },
  })

  function close() {
    setAdding(false)
    setName('')
    setError(undefined)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor="category" className="text-sm font-medium text-slate-700">Category</label>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="text-sm text-indigo-700 hover:underline">
            + New category
          </button>
        )}
      </div>
      <select id="category" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {adding && (
        <div className="mt-2 flex gap-2">
          <input
            aria-label="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault() // otherwise Enter would submit the expense form
                create.mutate(name)
              }
            }}
            placeholder="e.g. Gym"
            className={inputClass}
            autoFocus
          />
          <button type="button" onClick={() => create.mutate(name)} disabled={create.isPending}
            className="rounded-md bg-slate-800 px-3 text-sm font-medium text-white disabled:opacity-60">
            Create
          </button>
          <button type="button" onClick={close} className="px-2 text-sm text-slate-500 hover:text-slate-800">
            Cancel
          </button>
        </div>
      )}
      <FieldError messages={error} />
    </div>
  )
}