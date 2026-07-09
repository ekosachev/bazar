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
import { RequireAuth } from '@/features/auth/components/require-auth'
import { LoginPage } from '@/features/auth/pages/login-page'
import { RegisterPage } from '@/features/auth/pages/register-page'

function HomePage() {
  return (
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPlaceholder />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}
