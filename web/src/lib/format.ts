const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })

export function formatMoney(amount: number): string {
  return money.format(amount)
}

export function formatDate(isoDate: string): string {
  // "2026-11-02" -> "Nov 2, 2026" (no time zone shift)
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function today(): string {
  const now = new Date()
  return `${currentMonth()}-${String(now.getDate()).padStart(2, '0')}`
}
