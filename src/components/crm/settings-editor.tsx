'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export function SettingsEditor({ username }: { username: string }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      toast.error('New password and confirmation do not match.')
      return
    }
    if (next.length < 10 || !/[a-zA-Z]/.test(next) || !/\d/.test(next)) {
      toast.error('New password must be at least 10 characters with at least one letter and one number.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Could not change password.')
        setLoading(false)
        return
      }
      toast.success('Password changed. Use the new password next time you sign in.')
      setCurrent(''); setNext(''); setConfirm('')
    } catch {
      toast.error('Network error — try again.')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <p className="text-sm font-medium">Account security</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Signed in as</span>
            <code className="font-mono text-foreground bg-muted px-2 py-0.5 rounded">{username}</code>
          </div>
          <div className="flex items-center justify-between">
            <span>Password storage</span>
            <span className="text-foreground">scrypt hash (in database)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Rate limit</span>
            <span className="text-foreground">5 failed attempts / 15 min / IP</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Session</span>
            <span className="text-foreground">7-day JWT · httpOnly · SameSite=Strict</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Security headers</span>
            <span className="text-foreground">HSTS · CSP · X-Frame-Options: DENY</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="size-4" />
            <p className="text-sm font-medium">Change password</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current">Current password</Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showCurrent ? 'text' : 'password'}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="next">New password</Label>
              <div className="relative">
                <Input
                  id="next"
                  type={showNext ? 'text' : 'password'}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 10 characters, with at least one letter and one number.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input
                id="confirm"
                type={showNext ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" disabled={loading || !current || !next || !confirm}>
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {loading ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Forgot password?</p>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            If you ever forget your password, you can reset it from the server by
            editing the <code className="font-mono bg-muted px-1 py-0.5 rounded">.env</code> file
            (set a new <code className="font-mono bg-muted px-1 py-0.5 rounded">CRM_ADMIN_PASSWORD</code>),
            then deleting the <code className="font-mono bg-muted px-1 py-0.5 rounded">AdminUser</code> row
            in the database so the next login re-seeds from env.
          </p>
          <p>
            On Vercel: change the env var in
            {' '}<strong>Project Settings → Environment Variables</strong>, then redeploy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
