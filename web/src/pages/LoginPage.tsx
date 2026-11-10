import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { login, meQuery, register, type Credentials } from '../api/auth'
import { ApiError } from '../api/http'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string[]>([])
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (credentials: Credentials) => {
      if (mode === 'register') await register(credentials)
      await login(credentials)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey })
      navigate('/')
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) setError(['Invalid email or password.'])
      else if (e instanceof ApiError && e.problem.errors) setError(Object.values(e.problem.errors).flat())
      else setError(['Something went wrong. Please try again.'])
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError([])
    mutation.mutate({ email: String(data.get('email')), password: String(data.get('password')) })
  }

  const input = 'w-full rounded-md border border-slate-300 px-3 py-2'
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-4 text-xl font-bold text-slate-900">{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium">Email<input name="email" type="email" required className={input} /></label>
        <label className="block text-sm font-medium">Password<input name="password" type="password" required className={input} /></label>
        {error.map((m) => <p key={m} role="alert" className="text-sm text-red-600">{m}</p>)}
        <button disabled={mutation.isPending} className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60">
          {mutation.isPending ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError([]) }} className="mt-4 text-sm text-indigo-700 hover:underline">
        {mode === 'login' ? 'No account? Create one' : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}