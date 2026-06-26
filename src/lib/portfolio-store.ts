'use client'

import { create } from 'zustand'
import {
  type PortfolioData,
  type PortfolioConfig,
  type Project,
  type Stat,
  type StackGroup,
  type StackItem,
  type Social,
  type MarqueeItem,
  EMPTY_CONFIG,
  newId,
} from '@/lib/portfolio-types'

type State = {
  data: PortfolioData
  // status flags
  loading: boolean
  saving: boolean
  dirty: boolean
  lastSavedAt: number | null
  // actions
  load: () => Promise<void>
  save: () => Promise<void>
  reset: () => Promise<void>

  // config mutators
  setConfig: (patch: Partial<PortfolioConfig>) => void

  // marquee
  addMarquee: () => void
  updateMarquee: (id: string, patch: Partial<MarqueeItem>) => void
  removeMarquee: (id: string) => void
  moveMarquee: (id: string, dir: -1 | 1) => void

  // projects
  addProject: () => void
  updateProject: (id: string, patch: Partial<Project>) => void
  removeProject: (id: string) => void
  moveProject: (id: string, dir: -1 | 1) => void
  addProjectTech: (projectId: string) => void
  updateProjectTech: (projectId: string, techId: string, name: string) => void
  removeProjectTech: (projectId: string, techId: string) => void

  // stats
  addStat: () => void
  updateStat: (id: string, patch: Partial<Stat>) => void
  removeStat: (id: string) => void
  moveStat: (id: string, dir: -1 | 1) => void

  // stack
  addStackGroup: () => void
  updateStackGroup: (id: string, patch: Partial<StackGroup>) => void
  removeStackGroup: (id: string) => void
  moveStackGroup: (id: string, dir: -1 | 1) => void
  addStackItem: (groupId: string) => void
  updateStackItem: (groupId: string, itemId: string, name: string) => void
  removeStackItem: (groupId: string, itemId: string) => void

  // socials
  addSocial: () => void
  updateSocial: (id: string, patch: Partial<Social>) => void
  removeSocial: (id: string) => void
  moveSocial: (id: string, dir: -1 | 1) => void
}

const EMPTY_DATA: PortfolioData = {
  config: { ...EMPTY_CONFIG },
  marquee: [],
  projects: [],
  stats: [],
  stack: [],
  socials: [],
}

function swap<T>(arr: T[], i: number, j: number) {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return arr
  const next = [...arr]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export const usePortfolio = create<State>((set, get) => ({
  data: EMPTY_DATA,
  loading: true,
  saving: false,
  dirty: false,
  lastSavedAt: null,

  load: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/portfolio', { cache: 'no-store' })
      const json = (await res.json()) as PortfolioData
      set({
        data: {
          config: { ...EMPTY_CONFIG, ...(json.config ?? {}) } as PortfolioConfig,
          marquee: json.marquee ?? [],
          projects: json.projects ?? [],
          stats: json.stats ?? [],
          stack: json.stack ?? [],
          socials: json.socials ?? [],
        },
        loading: false,
        dirty: false,
      })
    } catch (e) {
      console.error('load failed', e)
      set({ loading: false })
    }
  },

  save: async () => {
    set({ saving: true })
    try {
      // Normalize all `order` fields based on array index before sending.
      const d = get().data
      const payload: PortfolioData = {
        config: d.config,
        marquee: d.marquee.map((m, i) => ({ ...m, order: i })),
        projects: d.projects.map((p, i) => ({
          ...p,
          order: i,
          techs: p.techs.map((t, j) => ({ ...t, order: j })),
        })),
        stats: d.stats.map((s, i) => ({ ...s, order: i })),
        stack: d.stack.map((g, i) => ({
          ...g,
          order: i,
          items: g.items.map((it, j) => ({ ...it, order: j })),
        })),
        socials: d.socials.map((s, i) => ({ ...s, order: i })),
      }
      await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      set({ saving: false, dirty: false, lastSavedAt: Date.now() })
    } catch (e) {
      console.error('save failed', e)
      set({ saving: false })
    }
  },

  reset: async () => {
    // Just reloads from the server — discards local unsaved edits.
    await get().load()
  },

  setConfig: (patch) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, config: { ...s.data.config, ...patch } },
    })),

  // ─── Marquee ───
  addMarquee: () =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        marquee: [...s.data.marquee, { id: newId(), text: 'New skill', order: s.data.marquee.length }],
      },
    })),
  updateMarquee: (id, patch) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        marquee: s.data.marquee.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    })),
  removeMarquee: (id) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, marquee: s.data.marquee.filter((m) => m.id !== id) },
    })),
  moveMarquee: (id, dir) =>
    set((s) => {
      const idx = s.data.marquee.findIndex((m) => m.id === id)
      return {
        dirty: true,
        data: { ...s.data, marquee: swap(s.data.marquee, idx, idx + dir) },
      }
    }),

  // ─── Projects ───
  addProject: () =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        projects: [
          ...s.data.projects,
          {
            id: newId(),
            tag: 'New tag',
            year: String(new Date().getFullYear()),
            title: 'New Project',
            description: 'A short description of this project.',
            liveUrl: 'https://',
            order: s.data.projects.length,
            techs: [],
          },
        ],
      },
    })),
  updateProject: (id, patch) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        projects: s.data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      },
    })),
  removeProject: (id) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, projects: s.data.projects.filter((p) => p.id !== id) },
    })),
  moveProject: (id, dir) =>
    set((s) => {
      const idx = s.data.projects.findIndex((p) => p.id === id)
      return {
        dirty: true,
        data: { ...s.data, projects: swap(s.data.projects, idx, idx + dir) },
      }
    }),
  addProjectTech: (projectId) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        projects: s.data.projects.map((p) =>
          p.id === projectId
            ? { ...p, techs: [...p.techs, { id: newId(), name: 'New tech', order: p.techs.length }] }
            : p,
        ),
      },
    })),
  updateProjectTech: (projectId, techId, name) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        projects: s.data.projects.map((p) =>
          p.id === projectId
            ? { ...p, techs: p.techs.map((t) => (t.id === techId ? { ...t, name } : t)) }
            : p,
        ),
      },
    })),
  removeProjectTech: (projectId, techId) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        projects: s.data.projects.map((p) =>
          p.id === projectId ? { ...p, techs: p.techs.filter((t) => t.id !== techId) } : p,
        ),
      },
    })),

  // ─── Stats ───
  addStat: () =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        stats: [
          ...s.data.stats,
          { id: newId(), count: 0, suffix: '', label: 'New stat', order: s.data.stats.length },
        ],
      },
    })),
  updateStat: (id, patch) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, stats: s.data.stats.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
    })),
  removeStat: (id) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, stats: s.data.stats.filter((x) => x.id !== id) },
    })),
  moveStat: (id, dir) =>
    set((s) => {
      const idx = s.data.stats.findIndex((x) => x.id === id)
      return {
        dirty: true,
        data: { ...s.data, stats: swap(s.data.stats, idx, idx + dir) },
      }
    }),

  // ─── Stack ───
  addStackGroup: () =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        stack: [
          ...s.data.stack,
          { id: newId(), title: 'New Group', order: s.data.stack.length, items: [] },
        ],
      },
    })),
  updateStackGroup: (id, patch) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, stack: s.data.stack.map((g) => (g.id === id ? { ...g, ...patch } : g)) },
    })),
  removeStackGroup: (id) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, stack: s.data.stack.filter((g) => g.id !== id) },
    })),
  moveStackGroup: (id, dir) =>
    set((s) => {
      const idx = s.data.stack.findIndex((g) => g.id === id)
      return {
        dirty: true,
        data: { ...s.data, stack: swap(s.data.stack, idx, idx + dir) },
      }
    }),
  addStackItem: (groupId) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        stack: s.data.stack.map((g) =>
          g.id === groupId
            ? { ...g, items: [...g.items, { id: newId(), name: 'New item', order: g.items.length }] }
            : g,
        ),
      },
    })),
  updateStackItem: (groupId, itemId, name) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        stack: s.data.stack.map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, name } : it)) }
            : g,
        ),
      },
    })),
  removeStackItem: (groupId, itemId) =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        stack: s.data.stack.map((g) =>
          g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g,
        ),
      },
    })),

  // ─── Socials ───
  addSocial: () =>
    set((s) => ({
      dirty: true,
      data: {
        ...s.data,
        socials: [
          ...s.data.socials,
          { id: newId(), label: 'New Link', url: 'https://', order: s.data.socials.length },
        ],
      },
    })),
  updateSocial: (id, patch) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, socials: s.data.socials.map((x) => (x.id === id ? { ...x, ...patch } : x)) },
    })),
  removeSocial: (id) =>
    set((s) => ({
      dirty: true,
      data: { ...s.data, socials: s.data.socials.filter((x) => x.id !== id) },
    })),
  moveSocial: (id, dir) =>
    set((s) => {
      const idx = s.data.socials.findIndex((x) => x.id === id)
      return {
        dirty: true,
        data: { ...s.data, socials: swap(s.data.socials, idx, idx + dir) },
      }
    }),
}))
