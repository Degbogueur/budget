import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { ExpensesPage } from './pages/ExpensesPage'
import { LoginPage } from './pages/LoginPage'

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: '/', Component: ExpensesPage },
      { path: '/login', Component: LoginPage },
      { path: '*', element: <p>Page not found.</p> },
    ],
  },
])