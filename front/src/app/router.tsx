import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'

function HomePage() {
  return <AppShell />
}

function LoginPlaceholder() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-bg-elevated p-6 shadow-md">
        <div className="space-y-1 text-center">
          <h1 className="font-display text-display text-content">Bazar</h1>
          <p className="text-body text-content-muted">Экран входа — зона второго фронтендера</p>
        </div>
      </div>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}
