import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router'
import { meQuery } from '../api/auth'

export function RequireAuth() {
  const { data: user, isPending } = useQuery(meQuery)

  if (isPending) return <p className="text-slate-500">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}