'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function HeroEditor() {
  const config = usePortfolio((s) => s.data.config)
  const setConfig = usePortfolio((s) => s.setConfig)

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        The hero is the first thing visitors see. The title is split into three lines so the
        italic accent words can sit naturally inside the sentence.
      </p>

      <div className="grid gap-2">
        <Label htmlFor="heroEyebrow">Eyebrow (small label above title)</Label>
        <Input
          id="heroEyebrow"
          value={config.heroEyebrow}
          onChange={(e) => setConfig({ heroEyebrow: e.target.value })}
        />
      </div>

      <div className="rounded-lg border border-dashed p-4 space-y-3 bg-muted/30">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Title — line 1
        </p>
        <Input
          value={config.heroLine1}
          onChange={(e) => setConfig({ heroLine1: e.target.value })}
        />
      </div>

      <div className="rounded-lg border border-dashed p-4 space-y-3 bg-muted/30">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Title — line 2
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="heroLine2Em" className="text-xs">Italic accent word</Label>
            <Input
              id="heroLine2Em"
              value={config.heroLine2Em}
              onChange={(e) => setConfig({ heroLine2Em: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="heroLine2Text" className="text-xs">Rest of line</Label>
            <Input
              id="heroLine2Text"
              value={config.heroLine2Text}
              onChange={(e) => setConfig({ heroLine2Text: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-4 space-y-3 bg-muted/30">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Title — line 3
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="heroLine3Pre" className="text-xs">Text before italic</Label>
            <Input
              id="heroLine3Pre"
              value={config.heroLine3Pre}
              onChange={(e) => setConfig({ heroLine3Pre: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="heroLine3Em" className="text-xs">Italic accent word</Label>
            <Input
              id="heroLine3Em"
              value={config.heroLine3Em}
              onChange={(e) => setConfig({ heroLine3Em: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="heroLede">Lede paragraph (supports &lt;strong&gt;)</Label>
        <Textarea
          id="heroLede"
          rows={3}
          value={config.heroLede}
          onChange={(e) => setConfig({ heroLede: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          You can wrap text in &lt;strong&gt;…&lt;/strong&gt; to make it bold.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="heroPrimaryBtn">Primary button label</Label>
          <Input
            id="heroPrimaryBtn"
            value={config.heroPrimaryBtn}
            onChange={(e) => setConfig({ heroPrimaryBtn: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="heroSecondaryBtn">Secondary button label</Label>
          <Input
            id="heroSecondaryBtn"
            value={config.heroSecondaryBtn}
            onChange={(e) => setConfig({ heroSecondaryBtn: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
