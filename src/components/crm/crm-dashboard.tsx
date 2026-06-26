'use client'

import { useEffect, useState } from 'react'
import { usePortfolio } from '@/lib/portfolio-store'
import { LivePreview } from '@/components/crm/live-preview'
import { HeroEditor } from '@/components/crm/hero-editor'
import { MarqueeEditor } from '@/components/crm/marquee-editor'
import { ProjectsEditor } from '@/components/crm/projects-editor'
import { AboutEditor } from '@/components/crm/about-editor'
import { StackEditor } from '@/components/crm/stack-editor'
import { ContactEditor } from '@/components/crm/contact-editor'
import { BrandingEditor } from '@/components/crm/branding-editor'
import { SettingsEditor } from '@/components/crm/settings-editor'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  Sparkles, Layout, Sliders, FolderKanban, User, Layers,
  Mail, Save, Download, RotateCcw, Monitor, Smartphone,
  CheckCircle2, Loader2, Eye, EyeOff, PanelRightClose, PanelRight,
  ExternalLink, LogOut, ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { PortfolioData } from '@/lib/portfolio-types'

type Section =
  | 'hero' | 'marquee' | 'projects' | 'about'
  | 'stack' | 'contact' | 'branding' | 'settings'

const NAV: { id: Section; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'hero', label: 'Hero', icon: Sparkles, hint: 'Top intro section' },
  { id: 'marquee', label: 'Marquee', icon: Sliders, hint: 'Scrolling skill strip' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, hint: 'Work cards grid' },
  { id: 'about', label: 'About', icon: User, hint: 'Bio + stats' },
  { id: 'stack', label: 'Stack', icon: Layers, hint: 'Tool groups' },
  { id: 'contact', label: 'Contact', icon: Mail, hint: 'Email + socials' },
  { id: 'branding', label: 'Branding & SEO', icon: Layout, hint: 'Brand, meta, footer' },
  { id: 'settings', label: 'Security', icon: ShieldCheck, hint: 'Change password' },
]

export function CrmDashboard({
  username,
  dataSeed,
  origin,
  nonce,
}: {
  username: string
  dataSeed: PortfolioData
  origin: string
  nonce?: string
}) {
  const router = useRouter()
  const [active, setActive] = useState<Section>('hero')
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(true)

  const loading = usePortfolio((s) => s.loading)
  const saving = usePortfolio((s) => s.saving)
  const dirty = usePortfolio((s) => s.dirty)
  const lastSavedAt = usePortfolio((s) => s.lastSavedAt)
  const hydrate = usePortfolio((s) => s.hydrate)
  const save = usePortfolio((s) => s.save)

  // Hydrate the in-memory store with server-rendered data on mount so the
  // editor opens instantly with content already populated.
  useEffect(() => {
    hydrate(dataSeed)
  }, [hydrate, dataSeed])

  // Warn before navigating away if there are unsaved changes.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const handleSave = async () => {
    const t = toast.loading('Saving…')
    try {
      await save()
      toast.success('Saved to database', { id: t })
    } catch {
      toast.error('Save failed', { id: t })
    }
  }

  const handleReset = async () => {
    if (!dirty) return
    if (!confirm('Discard all unsaved changes and reload from database?')) return
    // Reload from the server — discards local edits.
    router.refresh()
    setTimeout(() => window.location.reload(), 100)
  }

  const handleExportHtml = () => {
    if (dirty) {
      toast.warning('You have unsaved changes — exporting the last saved version. Click "Save" first to include your latest edits.')
    }
    // Hit the export endpoint; the browser will download the file.
    window.location.href = '/api/export-html'
    toast.success('Downloading index.html…')
  }

  const handleLogout = async () => {
    if (dirty && !confirm('You have unsaved changes. Log out anyway?')) return
    await fetch('/api/auth/logout', { method: 'POST' })
    router.refresh()
    setTimeout(() => window.location.reload(), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Loading portfolio data…</p>
        </div>
      </div>
    )
  }

  let editor: React.ReactNode
  switch (active) {
    case 'hero': editor = <HeroEditor />; break
    case 'marquee': editor = <MarqueeEditor />; break
    case 'projects': editor = <ProjectsEditor />; break
    case 'about': editor = <AboutEditor />; break
    case 'stack': editor = <StackEditor />; break
    case 'contact': editor = <ContactEditor />; break
    case 'branding': editor = <BrandingEditor />; break
    case 'settings': editor = <SettingsEditor username={username} />; break
  }

  const activeNav = NAV.find((n) => n.id === active)!

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ─── Top bar ─── */}
      <header className="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-foreground text-background grid place-items-center font-mono text-xs font-semibold">
              CRM
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-medium truncate">Portfolio CRM</span>
              <span className="text-[10px] text-muted-foreground truncate">
                Edit anything · Save · Export back to HTML
              </span>
            </div>
          </div>
          {dirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              Unsaved changes
            </Badge>
          )}
          {!dirty && lastSavedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              All changes saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline-flex items-center gap-1.5 mr-1">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
            Signed in as <strong className="font-medium text-foreground">{username}</strong>
          </span>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="size-4 mr-1.5" />
              View portfolio
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={!dirty || saving}>
            <RotateCcw className="size-4 mr-1.5" />
            Revert
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportHtml} disabled={saving}>
            <Download className="size-4 mr-1.5" />
            Export HTML
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="size-4 mr-1.5" />
            )}
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* ─── Body: sidebar + editor + preview ─── */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <nav className="w-56 border-r bg-muted/30 flex flex-col shrink-0">
          <ul className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {NAV.map((n) => {
              const Icon = n.icon
              const isActive = active === n.id
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setActive(n.id)}
                    className={cn(
                      'w-full flex items-start gap-3 rounded-md px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'hover:bg-muted text-foreground/80',
                    )}
                  >
                    <Icon className="size-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-sm font-medium truncate">{n.label}</span>
                      <span
                        className={cn(
                          'text-[10px] truncate',
                          isActive ? 'text-background/60' : 'text-muted-foreground',
                        )}
                      >
                        {n.hint}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="p-3 border-t text-[11px] text-muted-foreground leading-snug">
            <p>
              <strong className="text-foreground">Tip:</strong> Every edit updates the live
              preview instantly. Hit <em>Save</em> to persist, or <em>Export HTML</em> to
              download a standalone index.html for your static site.
            </p>
          </div>
        </nav>

        {/* Editor panel */}
        <section className="flex-1 min-w-0 overflow-y-auto bg-background">
          <div className="max-w-2xl mx-auto p-6 pb-24">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">{activeNav.label}</h2>
              <span className="text-xs text-muted-foreground">{activeNav.hint}</span>
            </div>
            {editor}
          </div>
        </section>

        {/* Preview panel */}
        {showPreview && (
          <aside className="w-[44%] min-w-[420px] border-l bg-muted/20 flex flex-col shrink-0">
            <div className="h-12 border-b flex items-center justify-between px-3 gap-2 bg-background">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="size-3.5" />
                <span className="font-medium">Live preview</span>
                <span className="text-muted-foreground/60">·</span>
                <span>updates as you type</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex rounded-md border bg-background">
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => setPreviewWidth('desktop')}
                    className={cn(
                      'h-7 px-2 rounded-r-none',
                      previewWidth === 'desktop' && 'bg-muted',
                    )}
                    title="Desktop view"
                  >
                    <Monitor className="size-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => setPreviewWidth('mobile')}
                    className={cn(
                      'h-7 px-2 rounded-l-none',
                      previewWidth === 'mobile' && 'bg-muted',
                    )}
                    title="Mobile view"
                  >
                    <Smartphone className="size-3.5" />
                  </Button>
                </div>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => setShowPreview(false)}
                  className="h-7 px-2"
                  title="Hide preview"
                >
                  <PanelRightClose className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-3">
              <LivePreview width={previewWidth} origin={origin} />
            </div>
          </aside>
        )}
        {!showPreview && (
          <Button
            size="sm" variant="outline"
            onClick={() => setShowPreview(true)}
            className="absolute right-4 top-16"
          >
            <PanelRight className="size-4 mr-1.5" />
            Show preview
          </Button>
        )}
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
