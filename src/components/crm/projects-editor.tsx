'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ProjectsEditor() {
  const projects = usePortfolio((s) => s.data.projects)
  const section = usePortfolio((s) => s.data.config)
  const setConfig = usePortfolio((s) => s.setConfig)
  const add = usePortfolio((s) => s.addProject)
  const update = usePortfolio((s) => s.updateProject)
  const remove = usePortfolio((s) => s.removeProject)
  const move = usePortfolio((s) => s.moveProject)
  const addTech = usePortfolio((s) => s.addProjectTech)
  const updateTech = usePortfolio((s) => s.updateProjectTech)
  const removeTech = usePortfolio((s) => s.removeProjectTech)

  return (
    <div className="space-y-6">
      {/* Section header editor */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Section header</p>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label className="text-xs">Index</Label>
            <Input
              value={section.workSectionIndex}
              onChange={(e) => setConfig({ workSectionIndex: e.target.value })}
            />
          </div>
          <div className="grid gap-2 col-span-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={section.workSectionTitle}
              onChange={(e) => setConfig({ workSectionTitle: e.target.value })}
            />
          </div>
          <div className="grid gap-2 col-span-3">
            <Label className="text-xs">Subtitle</Label>
            <Input
              value={section.workSectionSub}
              onChange={(e) => setConfig({ workSectionSub: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project cards */}
      <div className="space-y-4">
        {projects.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No projects yet. Add one to populate the work grid.
          </div>
        )}

        {projects.map((p, i) => (
          <Card key={p.id}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-muted text-xs font-mono grid place-items-center text-muted-foreground">
                  {i + 1}
                </span>
                <p className="font-medium truncate max-w-[280px]">{p.title || 'Untitled project'}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon" variant="ghost" disabled={i === 0}
                  onClick={() => move(p.id, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon" variant="ghost" disabled={i === projects.length - 1}
                  onClick={() => move(p.id, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => remove(p.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label className="text-xs">Tag (e.g. Classification)</Label>
                  <Input
                    value={p.tag}
                    onChange={(e) => update(p.id, { tag: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Year</Label>
                  <Input
                    value={p.year}
                    onChange={(e) => update(p.id, { year: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={p.title}
                  onChange={(e) => update(p.id, { title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={3}
                  value={p.description}
                  onChange={(e) => update(p.id, { description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Live URL</Label>
                <Input
                  value={p.liveUrl}
                  onChange={(e) => update(p.id, { liveUrl: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Tech stack (chips)</Label>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => addTech(p.id)}
                    className="h-7 px-2 text-xs"
                  >
                    <Plus className="size-3 mr-1" /> Add chip
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.techs.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No chips yet.</p>
                  )}
                  {p.techs.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-mono bg-background"
                    >
                      <input
                        value={t.name}
                        onChange={(e) => updateTech(p.id, t.id, e.target.value)}
                        className="bg-transparent outline-none w-20 text-xs"
                      />
                      <button
                        onClick={() => removeTech(p.id, t.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Remove chip"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={add} className="w-full">
        <Plus className="size-4 mr-2" /> Add project
      </Button>
    </div>
  )
}
