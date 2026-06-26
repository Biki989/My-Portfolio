'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

export function MarqueeEditor() {
  const items = usePortfolio((s) => s.data.marquee)
  const add = usePortfolio((s) => s.addMarquee)
  const update = usePortfolio((s) => s.updateMarquee)
  const remove = usePortfolio((s) => s.removeMarquee)
  const move = usePortfolio((s) => s.moveMarquee)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        The marquee is the horizontal scrolling strip below the hero. Items appear
        separated by a · and loop infinitely.
      </p>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No marquee items yet. Add one to start the strip.
          </div>
        )}
        {items.map((m, i) => (
          <div key={m.id} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-muted text-xs font-mono grid place-items-center text-muted-foreground shrink-0">
              {i + 1}
            </div>
            <Input
              value={m.text}
              onChange={(e) => update(m.id, { text: e.target.value })}
              placeholder="Skill name"
            />
            <Button
              size="icon"
              variant="ghost"
              disabled={i === 0}
              onClick={() => move(m.id, -1)}
              title="Move up"
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={i === items.length - 1}
              onClick={() => move(m.id, 1)}
              title="Move down"
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => remove(m.id)}
              title="Remove"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={add} className="w-full">
        <Plus className="size-4 mr-2" /> Add marquee item
      </Button>

      {items.length > 0 && (
        <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
          <Label className="text-xs uppercase tracking-wider">Preview order</Label>
          <p className="mt-1 font-mono">
            {items.map((m) => m.text).join(' · ')}
          </p>
        </div>
      )}
    </div>
  )
}
