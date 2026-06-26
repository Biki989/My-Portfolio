'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function StackEditor() {
  const config = usePortfolio((s) => s.data.config)
  const setConfig = usePortfolio((s) => s.setConfig)
  const groups = usePortfolio((s) => s.data.stack)
  const addGroup = usePortfolio((s) => s.addStackGroup)
  const updateGroup = usePortfolio((s) => s.updateStackGroup)
  const removeGroup = usePortfolio((s) => s.removeStackGroup)
  const moveGroup = usePortfolio((s) => s.moveStackGroup)
  const addItem = usePortfolio((s) => s.addStackItem)
  const updateItem = usePortfolio((s) => s.updateStackItem)
  const removeItem = usePortfolio((s) => s.removeStackItem)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Section header</p>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label className="text-xs">Index</Label>
            <Input
              value={config.stackSectionIndex}
              onChange={(e) => setConfig({ stackSectionIndex: e.target.value })}
            />
          </div>
          <div className="grid gap-2 col-span-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={config.stackSectionTitle}
              onChange={(e) => setConfig({ stackSectionTitle: e.target.value })}
            />
          </div>
          <div className="grid gap-2 col-span-3">
            <Label className="text-xs">Subtitle</Label>
            <Input
              value={config.stackSectionSub}
              onChange={(e) => setConfig({ stackSectionSub: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {groups.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No stack groups yet. Add one to start organizing your tools.
          </div>
        )}
        {groups.map((g, i) => (
          <Card key={g.id}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-7 h-7 rounded-md bg-muted text-xs font-mono grid place-items-center text-muted-foreground shrink-0">
                  {i + 1}
                </span>
                <Input
                  value={g.title}
                  onChange={(e) => updateGroup(g.id, { title: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon" variant="ghost" disabled={i === 0}
                  onClick={() => moveGroup(g.id, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon" variant="ghost" disabled={i === groups.length - 1}
                  onClick={() => moveGroup(g.id, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="icon" variant="ghost"
                  onClick={() => removeGroup(g.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {g.items.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No items yet.</p>
              )}
              {g.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-2 rounded-md border px-2 py-1 bg-background"
                >
                  <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
                  <input
                    value={it.name}
                    onChange={(e) => updateItem(g.id, it.id, e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm py-1"
                  />
                  <button
                    onClick={() => removeItem(g.id, it.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Remove item"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <Button
                size="sm" variant="ghost"
                onClick={() => addItem(g.id)}
                className="h-7 px-2 text-xs mt-1"
              >
                <Plus className="size-3 mr-1" /> Add item
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addGroup} className="w-full">
        <Plus className="size-4 mr-2" /> Add stack group
      </Button>
    </div>
  )
}
