function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <span className="text-lg font-bold text-slate-900">Budget</span>
      </div>
    </header>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">My expenses</h1>
        <p className="mt-2 text-slate-500">Welcome to your budget app.</p>
      </main>
    </div>
  )
}

export default App
