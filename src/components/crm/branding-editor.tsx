'use client'

import { usePortfolio } from '@/lib/portfolio-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function BrandingEditor() {
  const config = usePortfolio((s) => s.data.config)
  const setConfig = usePortfolio((s) => s.setConfig)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Brand / nav</p>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="grid gap-2">
            <Label className="text-xs">Brand mark (initials)</Label>
            <Input
              value={config.brandMark}
              onChange={(e) => setConfig({ brandMark: e.target.value })}
              maxLength={3}
            />
          </div>
          <div className="grid gap-2 col-span-2">
            <Label className="text-xs">Brand name</Label>
            <Input
              value={config.brandName}
              onChange={(e) => setConfig({ brandName: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">SEO</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-xs">&lt;title&gt; tag</Label>
            <Input
              value={config.seoTitle}
              onChange={(e) => setConfig({ seoTitle: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Meta description</Label>
            <Textarea
              rows={2}
              value={config.seoDescription}
              onChange={(e) => setConfig({ seoDescription: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium">Footer</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-xs">Copyright name</Label>
            <Input
              value={config.footerName}
              onChange={(e) => setConfig({ footerName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Renders as: © {new Date().getFullYear()} {config.footerName}
            </p>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Footer meta text (right side)</Label>
            <Input
              value={config.footerMeta}
              onChange={(e) => setConfig({ footerMeta: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
