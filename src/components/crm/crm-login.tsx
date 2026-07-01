'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function CrmLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Enter your username and password')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Login failed')
        setLoading(false)
        return
      }
      toast.success('Welcome back')
      // Reload so the server re-renders with the authenticated session.
      router.refresh()
      setTimeout(() => window.location.reload(), 200)
    } catch {
      toast.error('Network error — try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 size-[600px] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 size-[600px] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to portfolio
        </a>

        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="size-12 rounded-xl bg-foreground text-background grid place-items-center mb-4">
              <Lock className="size-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Portfolio CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to edit your live portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Admin access only.
        </p>
      </div>
    </div>
  )
}
