'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      setError('Email yoki parol noto\'g\'ri. Qaytadan urinib ko\'ring.')
    }
    // Muvaffaqiyatli bo'lsa, AuthGate avtomatik ravishda DashboardShell'ni ko'rsatadi
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Restoran Admin</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Tizimga kirish uchun email va parolingizni kiriting.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="admin@restoran.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Parol
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2 pr-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="вЂўвЂўвЂўвЂўвЂўвЂўвЂўвЂў"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-2 rounded-xl">
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
        </form>
      </div>
    </div>
  )
}
