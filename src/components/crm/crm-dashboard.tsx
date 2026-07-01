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
  ExternalLink, LogOut, ShieldCheck, Menu, X
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
  // Mobile UI state: sidebar drawer + mobile preview toggle
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobilePreview, setMobilePreview] = useState(false)

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
      <header className="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-3 sm:px-4 gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile: hamburger to open sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9"
            onClick={() => setSidebarOpen(true)}
            title="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-foreground text-background grid place-items-center font-mono text-xs font-semibold shrink-0">
              CRM
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-medium truncate">Portfolio CRM</span>
              <span className="text-[10px] text-muted-foreground truncate hidden sm:block">
                Edit your portfolio
              </span>
            </div>
          </div>
          {dirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 hidden sm:inline-flex">
              Unsaved
            </Badge>
          )}
          {!dirty && lastSavedAt && (
            <span className="text-xs text-muted-foreground items-center gap-1 hidden md:flex">
              <CheckCircle2 className="size-3 text-emerald-500" />
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs text-muted-foreground hidden md:inline-flex items-center gap-1.5 mr-1">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
            Signed in as <strong className="font-medium text-foreground">{username}</strong>
          </span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              <ExternalLink className="size-4 mr-1.5" />
              <span className="hidden md:inline">View portfolio</span>
              <span className="md:hidden">View</span>
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={!dirty || saving} className="hidden sm:inline-flex">
            <RotateCcw className="size-4 mr-1.5" />
            <span className="hidden md:inline">Revert</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportHtml} disabled={saving} className="hidden sm:inline-flex">
            <Download className="size-4 mr-1.5" />
            <span className="hidden md:inline">Export HTML</span>
            <span className="md:hidden">Export</span>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4 mr-1.5" />
            )}
            <span className="hidden sm:inline">{saving ? 'Saving…' : 'Save'}</span>
          </Button>
          {/* Mobile: toggle preview */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9"
            onClick={() => setMobilePreview(!mobilePreview)}
            title={mobilePreview ? 'Hide preview' : 'Show preview'}
          >
            {mobilePreview ? <PanelRightClose className="size-5" /> : <PanelRight className="size-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out" className="size-9">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* ─── Body: sidebar + editor + preview ─── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed on desktop, drawer on mobile */}
        <nav
          className={cn(
            'border-r bg-muted/30 flex-col shrink-0 z-40',
            'md:flex md:w-56 md:relative',
            // Mobile: drawer that slides in from the left
            'absolute top-0 bottom-0 w-72 max-w-[80vw] transition-transform duration-300',
            sidebarOpen ? 'translate-x-0 flex' : '-translate-x-full md:translate-x-0 md:flex',
          )}
        >
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end p-2">
            <Button
              variant="ghost" size="icon"
              className="size-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <ul className="p-2 space-y-0.5 flex-1 overflow-y-auto">
            {NAV.map((n) => {
              const Icon = n.icon
              const isActive = active === n.id
              return (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      setActive(n.id)
                      setSidebarOpen(false)
                      setMobilePreview(false)
                    }}
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
          <div className="p-3 border-t text-[11px] text-muted-foreground leading-snug hidden md:block">
            <p>
              Edits show in the preview instantly. Click <strong className="text-foreground">Save</strong> to publish to the live site.
            </p>
          </div>
        </nav>

        {/* Editor panel — full width on mobile, flex-1 on desktop */}
        <section
          className={cn(
            'flex-1 min-w-0 overflow-y-auto bg-background',
            // On mobile, hide the editor when preview is toggled on
            mobilePreview ? 'hidden md:block' : 'block',
          )}
        >
          <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-24">
            <div className="mb-5 flex items-baseline justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-semibold truncate">{activeNav.label}</h2>
              <span className="text-xs text-muted-foreground hidden sm:block">{activeNav.hint}</span>
            </div>
            {editor}
          </div>
        </section>

        {/* Preview panel — side-by-side on desktop, full-width overlay on mobile */}
        {showPreview && (
          <aside
            className={cn(
              'border-l bg-muted/20 flex-col shrink-0',
              'md:flex md:w-[44%] md:min-w-[420px] md:relative',
              // Mobile: full-width overlay when toggled on
              'absolute top-0 bottom-0 left-0 right-0 z-20',
              mobilePreview ? 'flex' : 'hidden md:flex',
            )}
          >
            <div className="h-12 border-b flex items-center justify-between px-3 gap-2 bg-background shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="size-3.5" />
                <span className="font-medium">Live preview</span>
                <span className="text-muted-foreground/60 hidden sm:inline">·</span>
                <span className="hidden sm:inline">updates as you type</span>
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
                  className="h-7 px-2 hidden md:inline-flex"
                  title="Hide preview"
                >
                  <PanelRightClose className="size-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-2 sm:p-3">
              <LivePreview width={previewWidth} origin={origin} />
            </div>
          </aside>
        )}
        {!showPreview && (
          <Button
            size="sm" variant="outline"
            onClick={() => setShowPreview(true)}
            className="absolute right-4 top-16 z-20"
          >
            <PanelRight className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Show preview</span>
            <span className="sm:hidden">Preview</span>
          </Button>
        )}
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
