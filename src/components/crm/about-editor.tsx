'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export function AboutEditor() {
  const config = usePortfolio((s) => s.data.config)
  const setConfig = usePortfolio((s) => s.setConfig)
  const stats = usePortfolio((s) => s.data.stats)
  const addStat = usePortfolio((s) => s.addStat)
  const updateStat = usePortfolio((s) => s.updateStat)
  const removeStat = usePortfolio((s) => s.removeStat)
  const moveStat = usePortfolio((s) => s.moveStat)

  return (
    <div className="space-y-6">
      {/* Section header */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Section header</p>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label className="text-xs">Index</Label>
            <Input
              value={config.aboutSectionIndex}
              onChange={(e) => setConfig({ aboutSectionIndex: e.target.value })}
            />
          </div>
          <div className="grid gap-2 col-span-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={config.aboutSectionTitle}
              onChange={(e) => setConfig({ aboutSectionTitle: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">About body</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-xs">Lede (large italic — supports &lt;strong&gt;)</Label>
            <Textarea
              rows={2}
              value={config.aboutLede}
              onChange={(e) => setConfig({ aboutLede: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Left paragraph</Label>
            <Textarea
              rows={4}
              value={config.aboutPara1}
              onChange={(e) => setConfig({ aboutPara1: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Right paragraph</Label>
            <Textarea
              rows={4}
              value={config.aboutPara2}
              onChange={(e) => setConfig({ aboutPara2: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <p className="text-sm font-medium">Stats row</p>
          <Button size="sm" variant="ghost" onClick={addStat} className="h-7 px-2 text-xs">
            <Plus className="size-3 mr-1" /> Add stat
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No stats yet.</p>
          )}
          {stats.map((s, i) => (
            <div key={s.id} className="rounded-lg border p-3 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">Stat #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon" variant="ghost" disabled={i === 0}
                    onClick={() => moveStat(s.id, -1)}
                    className="size-7"
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" disabled={i === stats.length - 1}
                    onClick={() => moveStat(s.id, 1)}
                    className="size-7"
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => removeStat(s.id)}
                    className="size-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-1">
                  <Label className="text-xs">Count (number)</Label>
                  <Input
                    type="number"
                    value={s.count}
                    onChange={(e) => updateStat(s.id, { count: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Suffix (e.g. +, %, /7)</Label>
                  <Input
                    value={s.suffix}
                    onChange={(e) => updateStat(s.id, { suffix: e.target.value })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={s.label}
                    onChange={(e) => updateStat(s.id, { label: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
