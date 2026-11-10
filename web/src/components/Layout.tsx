import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Outlet, useNavigate } from 'react-router'
import { logout, meQuery } from '../api/auth'

export function Layout() {
  const { data: user } = useQuery(meQuery)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(meQuery.queryKey, null)
      queryClient.removeQueries({ queryKey: ['expenses'] }) // don't keep the previous user's data
      navigate('/login')
    },
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-slate-900">Budget</span>
          {user && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">{user.email}</span>
              <button onClick={() => logoutMutation.mutate()} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100">
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}