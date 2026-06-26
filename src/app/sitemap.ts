import type { MetadataRoute } from 'next'
import { loadPortfolio } from '@/lib/load-portfolio'

// Dynamic sitemap generated from the live portfolio content.
// After deploying to Vercel, set the SITE_URL env var to your real domain
// (e.g. https://biki-portfolio.vercel.app) so the URLs are absolute.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.SITE_URL ?? 'https://YOUR-VERCEL-DOMAIN.vercel.app').replace(/\/$/, '')
  const data = await loadPortfolio()
  const now = new Date()

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  // One URL per project (anchor links so crawlers associate keywords with them).
  for (const p of data.projects) {
    entries.push({
      url: `${siteUrl}/#work`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  // Resume PDF.
  entries.push({
    url: `${siteUrl}/Biki-1.2.pdf`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  })

  return entries
}
