import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExpenseList } from './ExpenseList'

const expenses = [
  { id: 1, description: 'Groceries', amount: 86.4, categoryId: 1, category: 'Food', date: '2026-11-02' },
  { id: 2, description: 'Rent', amount: 1450, categoryId: 2, category: 'Housing', date: '2026-11-01' },
]

describe('ExpenseList', () => {
  it('renders one row per expense', () => {
    render(<ExpenseList expenses={expenses} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
  })

  it('shows a message when the list is empty', () => {
    render(<ExpenseList expenses={[]} />)

    expect(screen.getByText(/no expenses/i)).toBeInTheDocument()
  })

  it('calls onDelete with the expense id', async () => {
    const onDelete = vi.fn()
    render(<ExpenseList expenses={expenses} onDelete={onDelete} />)

    await userEvent.click(screen.getByRole('button', { name: 'Delete Rent' }))

    expect(onDelete).toHaveBeenCalledWith(2)
  })
})