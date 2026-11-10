import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ExpensesPage } from './pages/ExpensesPage'
import { LoginPage } from './pages/LoginPage'

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: '/login', Component: LoginPage },
      {
        Component: RequireAuth, // everything below requires a signed-in user
        children: [{ path: '/', Component: ExpensesPage }],
      },
      { path: '*', element: <p>Page not found.</p> },
    ],
  },
])