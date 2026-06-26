'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ContactEditor() {
  const config = usePortfolio((s) => s.data.config)
  const setConfig = usePortfolio((s) => s.setConfig)
  const socials = usePortfolio((s) => s.data.socials)
  const addSocial = usePortfolio((s) => s.addSocial)
  const updateSocial = usePortfolio((s) => s.updateSocial)
  const removeSocial = usePortfolio((s) => s.removeSocial)
  const moveSocial = usePortfolio((s) => s.moveSocial)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Contact section</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-xs">Eyebrow (small label above email)</Label>
            <Input
              value={config.contactEyebrow}
              onChange={(e) => setConfig({ contactEyebrow: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Email (also used as the mailto link)</Label>
            <Input
              value={config.contactEmail}
              onChange={(e) => setConfig({ contactEmail: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Sub-text</Label>
            <Textarea
              rows={2}
              value={config.contactSub}
              onChange={(e) => setConfig({ contactSub: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <p className="text-sm font-medium">Socials / quick links</p>
          <Button size="sm" variant="ghost" onClick={addSocial} className="h-7 px-2 text-xs">
            <Plus className="size-3 mr-1" /> Add link
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {socials.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No links yet.</p>
          )}
          {socials.map((s, i) => (
            <div key={s.id} className="rounded-lg border p-3 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">Link #{i + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon" variant="ghost" disabled={i === 0}
                    onClick={() => moveSocial(s.id, -1)}
                    className="size-7"
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    size="icon" variant="ghost" disabled={i === socials.length - 1}
                    onClick={() => moveSocial(s.id, 1)}
                    className="size-7"
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => removeSocial(s.id)}
                    className="size-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-1 col-span-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={s.label}
                    onChange={(e) => updateSocial(s.id, { label: e.target.value })}
                  />
                </div>
                <div className="grid gap-1 col-span-2">
                  <Label className="text-xs">URL (https://… or /path for local files)</Label>
                  <Input
                    value={s.url}
                    onChange={(e) => updateSocial(s.id, { url: e.target.value })}
                    placeholder="https://github.com/you"
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
